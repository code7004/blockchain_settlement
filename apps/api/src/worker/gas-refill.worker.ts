import { MIN_TRX_FOR_SWEEP, REFILL_TRX_AMOUNT } from '@/core/constants';
import { EnvService } from '@/core/env/env.service';
import { TronService } from '@/infra/tron/tron.service';
import { Injectable } from '@nestjs/common';
import { WalletRepository } from '../domains/wallet/wallet.repository';
import { BaseWorker } from './base.worker';

@Injectable()
export class GasRefillWorker extends BaseWorker {
  constructor(
    private readonly env: EnvService,
    private readonly tronService: TronService,
    private readonly walletRepo: WalletRepository,
  ) {
    super('GasRefillWorker', env.getPollInterval('gasrefill'));
  }

  async process() {
    const wallets = await this.walletRepo.findActiveWallets();

    for (const wallet of wallets) {
      try {
        const trx = await this.tronService.getTrxBalance(wallet.address);

        if (trx >= MIN_TRX_FOR_SWEEP) {
          continue;
        }

        const txHash = await this.tronService.transferTrx(this.env.gasTankPrivateKey, wallet.address, REFILL_TRX_AMOUNT);

        this.logger.log(`wallet=${wallet.address} trx=${trx} txHash=${txHash}`);
      } catch (err) {
        this.logger.error(`wallet=${wallet.address}`, err);
      }
    }
  }
}
