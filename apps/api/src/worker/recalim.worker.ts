import { REFILL_TRX_AMOUNT } from '@/core/constants';
import { EnvService } from '@/core/env/env.service';
import { waitForMiliSeconds } from '@/core/utils/common';
import { PrismaService } from '@/infra/prisma/prisma.service';
import { TronService } from '@/infra/tron/tron.service';
import { Injectable } from '@nestjs/common';
import { AssetsReclaimJobStatus } from '@prisma/client';
import { BaseWorker } from './base.worker';

const BATCH_SIZE = 100;
const MIN_TRX_FOR_TOKEN_TRANSFER = 1;
const TRX_RESERVE_AMOUNT = 0.05;
// const CONFIRM_TIMEOUT_MS = 60_000;
// const CONFIRM_INTERVAL_MS = 2_000;

interface ReclaimJobRow {
  id: string;
  walletId: string;
  address: string;
  encryptedPrivateKey: string;
}

@Injectable()
export class ReclaimWorker extends BaseWorker {
  constructor(
    private readonly env: EnvService,
    private readonly prisma: PrismaService,
    private readonly tronService: TronService,
  ) {
    super('ReclaimWorker', env.getPollInterval('reclaim'));
  }

  async process(): Promise<void> {
    const jobs = await this.fetchJobs();

    if (jobs.length === 0) {
      return;
    }

    for (const job of jobs) {
      try {
        const privateKey = this.env.decryptPrivateKey(job.encryptedPrivateKey);

        this.logger.log(`Reclaim start walletId=${job.walletId} address=${job.address}`);

        // -----------------------------
        // 1. token reclaim
        // -----------------------------
        const tokenBalance = await this.tronService.getTokenBalance(job.address);

        if (tokenBalance > 0) {
          const trxBalance = await this.tronService.getTrxBalance(job.address);

          if (trxBalance < MIN_TRX_FOR_TOKEN_TRANSFER) {
            const refillAmount = Math.max(REFILL_TRX_AMOUNT, MIN_TRX_FOR_TOKEN_TRANSFER - trxBalance + TRX_RESERVE_AMOUNT);

            const refillTx = await this.tronService.transferTrx(this.env.gasTankPrivateKey, job.address, refillAmount);

            await waitForMiliSeconds(10000); //await this.tronService.waitForConfirm(refillTx, { timeoutMs: CONFIRM_TIMEOUT_MS, intervalMs: CONFIRM_INTERVAL_MS });

            this.logger.log(`TRX refilled walletId=${job.walletId} amount=${refillAmount} txHash=${refillTx}`);
          }

          const tokenTx = await this.tronService.transferToken(privateKey, this.env.hotWalletAddress, tokenBalance);

          await waitForMiliSeconds(10000); // this.tronService.waitForConfirm(tokenTx, { timeoutMs: CONFIRM_TIMEOUT_MS, intervalMs: CONFIRM_INTERVAL_MS });

          this.logger.log(`Token reclaimed walletId=${job.walletId} amount=${tokenBalance} txHash=${tokenTx}`);
        } else {
          this.logger.debug(`Skip token reclaim walletId=${job.walletId} reason=no-token`);
        }

        // -----------------------------
        // 2. trx reclaim
        // -----------------------------
        const trxBalance = await this.tronService.getTrxBalance(job.address);

        if (trxBalance > TRX_RESERVE_AMOUNT) {
          const amount = trxBalance - TRX_RESERVE_AMOUNT;

          const trxTx = await this.tronService.transferTrx(privateKey, this.env.gasTankAddress, amount);

          await waitForMiliSeconds(10000); //await this.tronService.waitForConfirm(trxTx, { timeoutMs: CONFIRM_TIMEOUT_MS, intervalMs: CONFIRM_INTERVAL_MS });

          this.logger.log(`TRX reclaimed walletId=${job.walletId} amount=${amount} txHash=${trxTx}`);
        } else {
          this.logger.debug(`Skip trx reclaim walletId=${job.walletId} reason=low-balance`);
        }

        // -----------------------------
        // 3. job 완료
        // -----------------------------
        await this.prisma.assetsReclaimJob.delete({ where: { id: job.id } });

        this.logger.log(`Reclaim success walletId=${job.walletId} address=${job.address}`);
      } catch (error) {
        this.logger.error(`Reclaim failed walletId=${job.walletId} address=${job.address}`, error);

        await this.prisma.assetsReclaimJob.update({ where: { id: job.id }, data: { status: AssetsReclaimJobStatus.FAILED, retryCount: { increment: 1 } } });
      }
    }
  }

  private async fetchJobs(): Promise<ReclaimJobRow[]> {
    return this.prisma.$queryRaw<ReclaimJobRow[]>`
      SELECT
        j.id,
        j."walletId",
        w.address,
        w."encryptedPrivateKey"
      FROM "AssetsReclaimJob" j
      JOIN "Wallet" w
        ON w.id = j."walletId"
      ORDER BY j."createdAt"
      LIMIT ${BATCH_SIZE}
      FOR UPDATE SKIP LOCKED
    `;
  }
}
