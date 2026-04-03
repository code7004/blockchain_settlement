import { SWEEP_MIN_AMOUNT } from '@/core/constants';
import { decryptPrivateKey } from '@/core/crypto/aes256';
import { EnvService } from '@/core/env/env.service';
import { PrismaService } from '@/infra/prisma/prisma.service';
import { TronService } from '@/infra/tron/tron.service';
import { Injectable, Logger } from '@nestjs/common';
import { DepositStatus, WalletStatus } from '@prisma/client';

const MIN_TRX_FOR_SWEEP = 0.1;

@Injectable()
export class SweepService {
  private readonly logger = new Logger(SweepService.name);

  constructor(
    private readonly env: EnvService,
    private readonly prisma: PrismaService,
    private readonly tronService: TronService,
  ) {}

  async run(): Promise<void> {
    const hotWallet = this.env.hotWalletAddress;

    if (!hotWallet) {
      this.logger.error('HOT_WALLET_ADDRESS not configured');
      return;
    }

    const candidates = await this.findSweepCandidates();

    for (const wallet of candidates) {
      try {
        if (wallet.address === hotWallet) {
          this.logger.warn(`[Sweep] skip hot wallet address=${wallet.address}`);
          continue;
        }

        const tokenBalance = await this.tronService.getTokenBalance(wallet.tokenContract, wallet.address);

        if (tokenBalance <= SWEEP_MIN_AMOUNT) {
          continue;
        }

        const trxBalance = await this.tronService.getTrxBalance(wallet.address);

        if (trxBalance < MIN_TRX_FOR_SWEEP) {
          this.logger.warn(`[Sweep] wallet=${wallet.address} skip insufficient TRX gas trx=${trxBalance}`);
          continue;
        }

        const privateKey = decryptPrivateKey(wallet.encryptedPrivateKey, this.env.walletMasterKey);

        const txHash = await this.tronService.transferToken(privateKey, wallet.tokenContract, hotWallet, tokenBalance);

        this.logger.log(`[Sweep] wallet=${wallet.address} token=${wallet.tokenSymbol} amount=${tokenBalance} txHash=${txHash}`);
      } catch (err) {
        this.logger.error(`[Sweep] wallet=${wallet.address} transfer failed`, err);
      }
    }
  }

  /**
   * CONFIRMED deposit 기준 sweep 대상 조회
   */
  private async findSweepCandidates() {
    const rows = await this.prisma.deposit.findMany({
      where: {
        status: DepositStatus.CONFIRMED,
        wallet: {
          status: WalletStatus.ACTIVE,
        },
      },
      distinct: ['walletId', 'tokenContract'],
      take: 100,
      orderBy: { id: 'asc' },
      select: {
        walletId: true,
        tokenSymbol: true,
        tokenContract: true,
        wallet: {
          select: {
            address: true,
            encryptedPrivateKey: true,
          },
        },
      },
    });

    return rows.map((r) => ({
      walletId: r.walletId,
      address: r.wallet.address,
      encryptedPrivateKey: r.wallet.encryptedPrivateKey,
      tokenSymbol: r.tokenSymbol,
      tokenContract: r.tokenContract,
    }));
  }
}
