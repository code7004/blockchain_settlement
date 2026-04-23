// --- Part 1/1 ---

import { EnvService } from '@/core/env/env.service';
import { waitForMiliSeconds } from '@/core/utils/common';
import { TronService } from '@/infra/tron/tron.service';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { DepositService } from '../domains/deposit/deposit.service';
import { BaseWorker } from './base.worker';

type DepositWorkerScanRecord = {
  lastScannedBlock?: number;
};

@Injectable()
export class DepositWorker extends BaseWorker implements OnModuleInit {
  private lastScannedBlock = 0;

  private readonly filePath = path.join(process.cwd(), 'runtime', 'watcher-state.json');

  constructor(
    private readonly env: EnvService,
    private readonly tronService: TronService,
    private readonly depositService: DepositService,
  ) {
    super('DepositWorker', env.getPollInterval('deposit'));
  }

  // ======================================================
  // Init
  // ======================================================

  onModuleInit(): void {
    void this.init().catch((e) => {
      this.logger.error(`init failed: ${e instanceof Error ? e.message : String(e)}`);
    });
  }

  private async init(): Promise<void> {
    if (!this.env.tronUsdtContract) {
      throw new Error('TRON_USDT_CONTRACT env is missing');
    }

    const saved = await this.loadLastBlock();

    if (saved !== null) {
      this.lastScannedBlock = saved;
      this.logger.log(`resumeBlock=${saved}`);
    } else {
      const latest = await this.tronService.getLatestBlockNumber();

      // 안전 버퍼 적용
      this.lastScannedBlock = latest - 20;

      this.logger.log(`startBlock=${this.lastScannedBlock}`);
    }

    super.onModuleInit();
  }

  // ======================================================
  // Main Process
  // ======================================================

  protected async process(): Promise<void> {
    const latest = await this.tronService.getLatestBlockNumber();
    const targetBlock = latest - 2;

    if (this.lastScannedBlock >= targetBlock) return;

    const minBlock = this.lastScannedBlock + 1;

    const MAX_BLOCK_PER_CYCLE = 10; // 🔥 줄여야 안정적
    const maxBlock = Math.min(targetBlock, minBlock + MAX_BLOCK_PER_CYCLE - 1);

    for (let block = minBlock; block <= maxBlock; block++) {
      try {
        // 🔥 block 단위 throttle + jitter
        await waitForMiliSeconds(150 + Math.random() * 300);

        const events = await this.tronService.getContractEventsByBlock({
          eventName: 'Transfer',
          blockNumber: block,
        });

        if (!events.length) {
          await this.commitBlock(block);
          continue;
        }

        this.logger.log(`[scan:block] block=${block}, events count=${events.length}`);

        for (const e of events) {
          try {
            const { transaction_id: txHash, block_number, result } = e;

            if (!txHash || !result?.to || !result?.value) continue;

            await this.depositService.handleDetectedTransfer({
              txHash,
              fromAddress: this.tronService.hexToBase58(result.from),
              toAddress: this.tronService.hexToBase58(result.to),
              amount: result.value,
              blockNumber: block_number,
            });
          } catch {
            this.logger.error(`event process failed`);
          }
        }

        await this.commitBlock(block);
      } catch (err: unknown) {
        if (this.tronService.isRateLimit(err)) {
          const delay = 1000 + Math.random() * 500;

          this.logger.warn(`rate limited block=${block} delay=${delay}`);

          await waitForMiliSeconds(delay);

          block--; // 🔥 동일 block 재시도
          continue;
        }

        this.logger.error(`block fetch failed: block=${block}`);
        break;
      }
    }

    this.logger.log(`[scan:end] range=${minBlock}~${maxBlock}, total:${maxBlock - minBlock}`);
  }

  // ======================================================
  // Cursor Handling
  // ======================================================

  private async commitBlock(block: number): Promise<void> {
    this.lastScannedBlock = block;
    await this.saveLastBlock(block);
  }

  private async loadLastBlock(): Promise<number | null> {
    if (this.env.useWatcherPollingCursor === false) return null;

    try {
      const raw = await fs.readFile(this.filePath, 'utf8');
      const json = JSON.parse(raw) as DepositWorkerScanRecord;

      return json.lastScannedBlock ?? null;
    } catch {
      return null;
    }
  }

  private async saveLastBlock(block: number): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });

    await fs.writeFile(
      this.filePath,
      JSON.stringify(
        {
          lastScannedBlock: block,
        },
        null,
        2,
      ),
    );
  }
}
