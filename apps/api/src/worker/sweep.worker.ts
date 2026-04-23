import { REFILL_TRX_AMOUNT } from '@/core/constants';
import { EnvService } from '@/core/env/env.service';
import { ExceptionLogService } from '@/domains/exception-log/exception-log.service';
import { PrismaService } from '@/infra/prisma/prisma.service';
import { TronService } from '@/infra/tron/tron.service';
import { Injectable } from '@nestjs/common';
import { Prisma, SweepJobStatus, SweepStatus } from '@prisma/client';
import { BaseWorker } from './base.worker';

const MIN_TRX_FOR_SWEEP = 0.1;

@Injectable()
export class SweepWorker extends BaseWorker {
  constructor(
    private readonly env: EnvService,
    private readonly prisma: PrismaService,
    private readonly tronService: TronService,
    private readonly exceptionLogService: ExceptionLogService,
  ) {
    super('SweepWorker', env.getPollInterval('sweep'));
  }

  protected async process(): Promise<void> {
    const hotWallet = this.env.hotWalletAddress;

    if (!hotWallet) {
      this.logger.error('HOT_WALLET_ADDRESS not configured');
      return;
    }

    const jobs = await this.prisma.sweepJob.findMany({
      take: 100,
      where: { status: SweepJobStatus.PENDING },
      orderBy: { createdAt: 'asc' },
      include: {
        deposit: {
          include: {
            wallet: true,
          },
        },
      },
    });

    for (const job of jobs) {
      const { deposit } = job;
      const wallet = deposit.wallet;

      try {
        const locked = await this.prisma.sweepJob.updateMany({
          where: {
            id: job.id,
            status: SweepJobStatus.PENDING,
          },
          data: {
            status: SweepJobStatus.PROCESSING,
            writer: this.env.name,
          },
        });

        if (locked.count === 0) {
          continue;
        }

        const hasTerminal = await this.hasTerminalSweepLog(deposit.id);
        if (hasTerminal) {
          await this.finishJob(job.id);
          continue;
        }

        const hasBroadcast = await this.hasPendingBroadcast(deposit.id);
        if (hasBroadcast) {
          this.logger.debug(`[Sweep] already broadcasted deposit=${deposit.id}`);
          await this.finishJob(job.id);
          continue;
        }

        if (wallet.address === hotWallet) {
          await this.writeLog({
            partnerId: wallet.partnerId,
            depositId: deposit.id,
            status: SweepStatus.SKIPPED,
            reason: 'HOT_WALLET_ADDRESS_MATCH',
            fromAddress: wallet.address,
            toAddress: hotWallet,
          });

          await this.finishJob(job.id);
          continue;
        }

        const trxBalance = await this.tronService.getTrxBalance(wallet.address);
        const tokenBalance = await this.tronService.getTokenBalance(wallet.address);

        if (tokenBalance <= 0) {
          await this.writeLog({
            partnerId: wallet.partnerId,
            depositId: deposit.id,
            status: SweepStatus.SKIPPED,
            reason: 'ZERO_TOKEN_BALANCE',
            fromAddress: wallet.address,
            toAddress: hotWallet,
            amount: new Prisma.Decimal(0),
          });

          await this.finishJob(job.id);
          continue;
        }

        if (trxBalance < MIN_TRX_FOR_SWEEP) {
          const refillTxHash = await this.tronService.transferTrx(this.env.gasTankPrivateKey, wallet.address, REFILL_TRX_AMOUNT);

          await this.writeLog({
            partnerId: wallet.partnerId,
            depositId: deposit.id,
            status: SweepStatus.PENDING,
            reason: 'TRX_REFILL_REQUIRED',
            fromAddress: wallet.address,
            toAddress: hotWallet,
            amount: this.toDecimal(tokenBalance),
            errorMessage: `refillTxHash=${refillTxHash}`,
          });

          this.logger.warn(`[Sweep] refill-required deposit=${deposit.id} wallet=${wallet.address} trx=${trxBalance} refillTxHash=${refillTxHash}`);

          await this.releaseJob(job.id);
          continue;
        }

        const privateKey = this.env.decryptPrivateKey(wallet.encryptedPrivateKey);
        const txHash = await this.tronService.transferToken(privateKey, hotWallet, tokenBalance);

        await this.writeLog({
          partnerId: wallet.partnerId,
          depositId: deposit.id,
          status: SweepStatus.BROADCASTED,
          txHash,
          fromAddress: wallet.address,
          toAddress: hotWallet,
          amount: this.toDecimal(tokenBalance),
        });

        this.logger.log(`[Sweep] broadcasted deposit=${deposit.id} wallet=${wallet.address} amount=${tokenBalance} txHash=${txHash}`);

        await this.finishJob(job.id);
      } catch (error: unknown) {
        await this.releaseJob(job.id);
        await this.exceptionLogService.captureWorkerException({
          exception: error,
          workerName: this.name,
          jobId: job.id,
          depositId: deposit.id,
          partnerId: wallet.partnerId,
        });
        this.logger.error(`[Sweep] deposit=${deposit.id} failed`, error);
      }
    }
  }

  private async releaseJob(jobId: string): Promise<void> {
    await this.prisma.sweepJob.updateMany({
      where: {
        id: jobId,
        status: SweepJobStatus.PROCESSING,
      },
      data: {
        status: SweepJobStatus.PENDING,
      },
    });
  }

  // 이미 BROADCASTED 상태 존재 여부
  private async hasPendingBroadcast(depositId: string): Promise<boolean> {
    const count = await this.prisma.sweepLog.count({
      where: {
        depositId,
        status: SweepStatus.BROADCASTED,
      },
    });

    return count > 0;
  }

  // CONFIRMED / SKIPPED면 종료 상태
  private async hasTerminalSweepLog(depositId: string): Promise<boolean> {
    const count = await this.prisma.sweepLog.count({
      where: {
        depositId,
        status: {
          in: [SweepStatus.CONFIRMED, SweepStatus.SKIPPED],
        },
      },
    });

    return count > 0;
  }

  private async finishJob(jobId: string): Promise<void> {
    await this.prisma.sweepJob.deleteMany({
      where: { id: jobId },
    });
  }

  private async writeLog(params: Prisma.SweepLogUncheckedCreateInput): Promise<void> {
    await this.prisma.sweepLog.create({
      data: {
        ...params,
        feeSymbol: params.feeSymbol ?? 'TRX',
        writer: this.env.name,
      },
    });
  }

  private toDecimal(value: number | string): Prisma.Decimal {
    return new Prisma.Decimal(value);
  }
}
