import { CALLBACK_EVENT_TYPE, CONFIRMATION_COUNT, USDT_SWEEP_MIN_AMOUNT } from '@/core/constants';
import { EnvService } from '@/core/env/env.service';
import { mapPrismaError } from '@/core/errors/prisma-exception.mapper';
import { PrismaService } from '@/infra/prisma/prisma.service';
import { TronService } from '@/infra/tron/tron.service';
import { Injectable, Logger } from '@nestjs/common';
import { CallbackStatus, DepositStatus, Prisma, SweepJobStatus, SweepStatus } from '@prisma/client';
import { TransactionInfo } from 'tronweb/lib/esm/types';
import { BaseWorker } from './base.worker';

@Injectable()
export class ConfirmWorker extends BaseWorker {
  private readonly internalLogger = new Logger(ConfirmWorker.name);

  constructor(
    private readonly env: EnvService,
    private readonly prisma: PrismaService,
    private readonly tronService: TronService,
  ) {
    super('ConfirmWorker', env.getPollInterval('confirm'));
  }

  protected async process(): Promise<void> {
    await this.processDepositConfirm();
    await this.processSweepConfirm();
  }

  private async processDepositConfirm(): Promise<void> {
    const latestBlock = await this.tronService.getLatestBlockNumber();

    const deposits = await this.prisma.deposit.findMany({
      where: {
        status: DepositStatus.DETECTED,
        blockNumber: { lte: latestBlock - CONFIRMATION_COUNT },
      },
      include: { partner: true, user: true },
      take: 100,
      orderBy: { detectedAt: 'asc' },
    });

    for (const deposit of deposits) {
      try {
        const confirmedAt = new Date();

        // ❗ 트랜잭션 밖에서 실행
        const tokenBalance = await this.tronService.getTokenBalance(deposit.toAddress);

        await this.prisma.$transaction(async (tx) => {
          const result = await tx.deposit.updateMany({
            where: { id: deposit.id, status: DepositStatus.DETECTED },
            data: { status: DepositStatus.CONFIRMED, confirmedAt },
          });

          if (result.count === 0) return;

          this.logger.log(`[DepositConfirm] deposit=${deposit.id} txHash=${deposit.txHash}`);

          const requestBody = {
            event: CALLBACK_EVENT_TYPE.CONFIRMED,
            to: deposit.toAddress,
            from: deposit.fromAddress,
            depositId: deposit.id,
            externalUserId: deposit.user.externalUserId,
            txHash: deposit.txHash,
            amount: deposit.amount,
            tokenSymbol: deposit.tokenSymbol,
            confirmedAt,
            detectedAt: deposit.detectedAt,
            confirmations: CONFIRMATION_COUNT,
            blockNumber: deposit.blockNumber,
            contractAddress: deposit.tokenContract,
          };

          const callback = await tx.callbackLog.create({
            data: {
              partnerId: deposit.partnerId,
              depositId: deposit.id,
              txHash: deposit.txHash,
              eventType: CALLBACK_EVENT_TYPE.CONFIRMED,
              callbackUrl: deposit.partner.callbackUrl,
              requestBody: JSON.stringify(requestBody),
              requestSignature: '',
              attemptCount: 0,
              maxAttempts: 3,
              writer: this.env.name,
              status: CallbackStatus.PENDING,
            },
          });

          await tx.callbackLog.update({
            where: { id: callback.id },
            data: {
              requestBody: JSON.stringify({
                ...requestBody,
                callbackId: callback.id,
              }),
            },
          });

          // ❗ 이미 구한 tokenBalance 사용
          if (tokenBalance > USDT_SWEEP_MIN_AMOUNT) {
            await tx.sweepJob.upsert({
              where: { depositId: deposit.id },
              update: {},
              create: {
                depositId: deposit.id,
                status: SweepJobStatus.PENDING,
              },
            });

            this.logger.log(`[SweepTrigger] deposit=${deposit.id} wallet=${deposit.toAddress} balance=${tokenBalance}`);
          }
        });
      } catch (error: unknown) {
        mapPrismaError(error);
      }
    }
  }

  private async processSweepConfirm(): Promise<void> {
    const latestBlock = await this.tronService.getLatestBlockNumber();

    const candidates = await this.prisma.sweepLog.findMany({
      where: {
        status: SweepStatus.BROADCASTED,
        txHash: { not: null },
      },
      include: { deposit: true },
      take: 100,
      orderBy: { createdAt: 'asc' },
    });

    for (const log of candidates) {
      if (!log.txHash) continue;

      try {
        const txInfo = await this.getTransactionInfoSafe(log.txHash);

        // 아직 체인에 없음
        if (!txInfo) {
          this.logger.debug(`[SweepConfirm] pending txHash=${log.txHash}`);
          continue;
        }

        const confirmedBlock = txInfo.blockNumber;

        // 블록 미포함 (pending 상태)
        if (!confirmedBlock) {
          this.logger.debug(`[SweepConfirm] no-block-yet txHash=${log.txHash}`);
          continue;
        }

        // 컨펌 수 부족
        const isConfirmed = confirmedBlock <= latestBlock - CONFIRMATION_COUNT;

        if (!isConfirmed) {
          this.logger.debug(`[SweepConfirm] waiting-confirmation txHash=${log.txHash} confirmedBlock=${confirmedBlock} latest=${latestBlock}`);
          continue;
        }

        // 체인 실행 결과
        const receiptResult = txInfo.receipt?.result;
        const isSuccess = receiptResult === 'SUCCESS';

        // 실패 처리
        if (!isSuccess) {
          await this.failSweepBroadcast(log.id, log.txHash, receiptResult ?? 'CHAIN_EXECUTION_FAILED');

          // 실패도 terminal → job 제거 (선택이지만 권장)
          await this.prisma.sweepJob.deleteMany({
            where: { depositId: log.depositId },
          });

          continue;
        }

        // 수수료 계산
        const feeAmount = this.extractTrxFee(txInfo);

        // 성공 처리 (멱등성 보장)
        await this.prisma.$transaction(async (tx) => {
          const updated = await tx.sweepLog.updateMany({
            where: {
              id: log.id,
              status: SweepStatus.BROADCASTED,
            },
            data: {
              status: SweepStatus.CONFIRMED,
              feeAmount,
              feeSymbol: 'TRX',
              reason: null,
              errorMessage: null,
              writer: this.env.name,
            },
          });

          if (updated.count === 0) return;

          // job 제거 (queue 종료)
          await tx.sweepJob.deleteMany({
            where: { depositId: log.depositId },
          });
        });

        this.logger.log(`[SweepConfirm] success deposit=${log.depositId} txHash=${log.txHash} fee=${Number(feeAmount ?? 0)}`);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        this.internalLogger.error(`[SweepConfirm] failed txHash=${log.txHash} error=${message}`);
      }
    }
  }

  private async failSweepBroadcast(sweepLogId: string, txHash: string, reason: string): Promise<void> {
    await this.prisma.sweepLog.updateMany({
      where: { id: sweepLogId, status: SweepStatus.BROADCASTED },
      data: { status: SweepStatus.FAILED, reason, errorMessage: `Sweep transaction failed on chain. txHash=${txHash}`, writer: this.env.name },
    });

    this.logger.warn(`[SweepConfirm] failed txHash=${txHash} reason=${reason}`);
  }

  private extractTrxFee(txInfo: TransactionInfo): Prisma.Decimal | undefined {
    const energyFeeSun = txInfo.receipt?.energy_fee ?? 0;
    const netFeeSun = txInfo.receipt?.net_fee ?? 0;
    const totalSun = energyFeeSun + netFeeSun;

    if (totalSun <= 0) return undefined;

    return new Prisma.Decimal(totalSun).div(1_000_000);
  }

  private async getTransactionInfoSafe(txHash: string) {
    try {
      const txInfo = await this.tronService.getTransactionInfo(txHash);
      return txInfo ?? null;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);

      if (message.includes('not found') || message.includes('Transaction not found')) {
        return null;
      }

      throw error;
    }
  }
}
