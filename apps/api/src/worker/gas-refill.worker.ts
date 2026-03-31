import { MIN_TRX_FOR_SWEEP, REFILL_TRX_AMOUNT } from '@/core/constants';
import { EnvService } from '@/core/env/env.service';
import { TronService } from '@/infra/tron/tron.service';
import { Injectable, Logger } from '@nestjs/common';
import { WalletRepository } from '../domains/wallet/wallet.repository';

@Injectable()
export class GasRefillWorker {
  private readonly logger = new Logger(GasRefillWorker.name);
  private pollInterval = 10000000;

  constructor(
    private readonly env: EnvService,
    private readonly walletRepo: WalletRepository,
    private readonly tronService: TronService,
  ) {
    this.pollInterval = this.env.getPollInterval('gasrefill');
  }

  onModuleInit() {
    this.logger.log(`STARTED interval=${this.pollInterval}ms -----------------------------`);
    setInterval(() => void this.run(), this.pollInterval);
  }

  async run() {
    const wallets = await this.walletRepo.findActiveWallets();

    for (const wallet of wallets) {
      try {
        const trx = await this.tronService.getTrxBalance(wallet.address);

        if (trx >= MIN_TRX_FOR_SWEEP) {
          continue;
        }

        const txHash = await this.tronService.sendTrx(this.env.gasTankPrivateKey, wallet.address, REFILL_TRX_AMOUNT);

        this.logger.log(`wallet=${wallet.address} trx=${trx} txHash=${txHash}`);
      } catch (err) {
        this.logger.error(`wallet=${wallet.address}`, err);
      }
    }
  }
}
