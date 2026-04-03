import { EnvService } from '@/core/env/env.service';
import { TronService } from '@/infra/tron/tron.service';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { DepositService } from '../domains/deposit/deposit.service';

type DeopsiWorkerScanRecord = { lastScannedBlock?: number };
/**
 * DepositWorker (Phase1 Day4)
 * - Controller와 분리된 Background Job
 * - N초 주기 Polling tick부터 구축
 */
@Injectable()
export class DepositWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DepositWorker.name);
  private timer: NodeJS.Timeout | null = null;

  private lastScannedBlock = 0;
  private pollInterval = 10000000;

  private readonly filePath = path.join(process.cwd(), 'runtime', 'watcher-state.json');

  constructor(
    private readonly env: EnvService,
    private readonly tronService: TronService,
    private readonly depositService: DepositService,
  ) {
    this.pollInterval = this.env.getPollInterval('deposit');
  }

  async loadLastBlock(): Promise<number | null> {
    if (this.env.useWatcherPollingCursor == false) return null;

    try {
      const raw = await fs.readFile(this.filePath, 'utf8');
      const json = JSON.parse(raw) as DeopsiWorkerScanRecord;
      return json.lastScannedBlock ?? null;
    } catch {
      return null;
    }
  }

  async saveLastBlock(block: number) {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });

    await fs.writeFile(this.filePath, JSON.stringify({ lastScannedBlock: block }, null, 2));
  }

  async onModuleInit() {
    if (!this.env.tronUsdtContract) {
      throw new Error('TRON_USDT_CONTRACT env is missing');
    }

    const saved = await this.loadLastBlock();

    if (saved) {
      this.lastScannedBlock = saved;
      this.logger.log(`resumeBlock=${saved}`);
    } else {
      const latest = await this.tronService.getLatestBlockNumber();
      this.lastScannedBlock = latest - 10;
      this.logger.log(`startBlock=${this.lastScannedBlock}`);
    }

    this.start();
  }

  onModuleDestroy() {
    // 서버 종료 시 watcher 정리
    this.stop();
  }

  private start() {
    if (this.timer) return;

    this.logger.log(`STARTED interval=${this.pollInterval}ms-----------------------------`);

    this.timer = setInterval(() => {
      void this.tick().catch((e) => {
        // watcher는 죽지 않고 다음 tick으로 넘어가야 함
        this.logger.error(`tick failed: ${e instanceof Error ? e.message : String(e)}`);
      });
    }, this.pollInterval);

    // 즉시 1회 실행 (기동 직후 확인 용이)
    void this.tick().catch((e) => {
      this.logger.error(`initial tick failed: ${e instanceof Error ? e.message : String(e)}`);
    });
  }

  private stop() {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
    this.logger.log('DepositWatcher stopped.');
  }

  private async tick() {
    await this.detectTransfers();
  }

  private async detectTransfers() {
    const latest = await this.tronService.getLatestBlockNumber();

    const targetBlock = latest - 2;

    if (this.lastScannedBlock >= targetBlock) {
      return;
    }

    for (let block = this.lastScannedBlock + 1; block <= targetBlock; block++) {
      const txs = await this.tronService.getBlockTransactions(block);

      this.logger.log(`[scan] block=${block} tx=${txs.length}`);

      for (const tx of txs) {
        const contracts = tx.raw_data.contract;

        for (const c of contracts) {
          const type = String(c.type);

          if (type !== 'TriggerSmartContract') continue;

          const value = c.parameter?.value as {
            contract_address: string;
            data: string;
            owner_address: string;
          };

          if (!value?.contract_address) continue;

          const contractAddress = this.tronService.hexToBase58(value.contract_address);

          if (contractAddress !== this.env.tronUsdtContract) continue;

          const data = value.data;

          if (!data.startsWith('a9059cbb')) continue;

          if (!data || data.length < 136) {
            this.logger.warn(`invalid data length tx=${tx.txID}`);
            continue;
          }

          const toHex = data.slice(8 + 24, 8 + 64);
          const amountHex = data.slice(8 + 64, 8 + 128);

          if (!amountHex) {
            this.logger.warn(`empty amountHex tx=${tx.txID}`);
            continue;
          }

          let amount: string;
          try {
            amount = BigInt(`0x${amountHex}`).toString();
          } catch {
            this.logger.warn(`invalid amountHex tx=${tx.txID}`);
            continue;
          }

          const toAddress = this.tronService.hexToBase58(`41${toHex}`);

          await this.depositService.handleDetectedTransfer({ txHash: tx.txID, toAddress, fromAddress: this.tronService.hexToBase58(value.owner_address), amount, blockNumber: block });

          this.logger.log(`TRC20 transfer detected tx=${tx.txID} to=${toAddress} amount=${amount}`);
        }
      }
      this.lastScannedBlock = block;
      await this.saveLastBlock(this.lastScannedBlock);
    }
  }
}
