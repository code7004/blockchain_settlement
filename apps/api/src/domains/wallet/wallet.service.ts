import { decryptPrivateKey, encryptPrivateKey } from '@/core/crypto/aes256';
import { EnvService } from '@/core/env/env.service';
import { mapPrismaError } from '@/core/errors/prisma-exception.mapper';
import { PrismaService } from '@/infra/prisma/prisma.service';
import { TronService } from '@/infra/tron/tron.service';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma, WalletStatus } from '@prisma/client';
import { AssetsSnapshotDto } from './dto/assets.snapshot.dto';
import { CreateReclaimJobsDto } from './dto/create-reclaim-jobs.dto';
import { GetWalletsQueryDto } from './dto/get-wallets.query.dto';
import { WalletRepository } from './wallet.repository';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly repo: WalletRepository,
    private readonly tronService: TronService,
    private readonly env: EnvService,
  ) {}

  /**
   * 1. Confirm user presence/activity (Wallet is user dependent)
   * 2. Create Tron account
   * 3. Encrypt privateKey immediately (평문 저장/ 로그 금지)
   * 4. Store DB (address UNIQUE 충돌시 재시도 1회)
   * @param userId - UUID of the user
   * @throws NotFoundException if user not found
   * @throws ForbiddenException if user inactive
   */
  async createWallet(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, partnerId: true, isActive: true },
      });
      if (!user || !user.isActive) throw new NotFoundException('User not found or inactive');

      const { address, privateKey } = await this.tronService.createAccount();

      const encryptedPrivateKey = encryptPrivateKey(privateKey, this.env.walletMasterKey);

      const wallet = await this.prisma.wallet.create({
        data: { partnerId: user.partnerId, userId: user.id, address, encryptedPrivateKey, status: WalletStatus.ACTIVE },
        select: { id: true, partnerId: true, userId: true, address: true, status: true, createdAt: true },
      });

      return wallet;
    } catch (err) {
      mapPrismaError(err);
    }
  }

  async createWalletByUser(user: { id: string; partnerId: string }, tx?: Prisma.TransactionClient) {
    try {
      const prisma = tx ?? this.prisma;

      const { address, privateKey } = await this.tronService.createAccount();

      const encryptedPrivateKey = encryptPrivateKey(privateKey, this.env.walletMasterKey);

      return prisma.wallet.create({
        data: { partnerId: user.partnerId, userId: user.id, address, encryptedPrivateKey, status: WalletStatus.ACTIVE },
      });
    } catch (err) {
      mapPrismaError(err);
    }
  }

  async findAll(dto: GetWalletsQueryDto) {
    try {
      return await this.repo.findAll(dto);
    } catch (err) {
      mapPrismaError(err);
    }
  }

  async createReclaimJobsAll(params: CreateReclaimJobsDto) {
    try {
      return this.repo.createReclaimJobsAll(params);
    } catch (err) {
      mapPrismaError(err);
    }
  }

  async getAssets(id: string) {
    try {
      const tron = this.tronService;
      const tokenSymbol = this.env.tokenSymbol;
      const wallet = await this.repo.findUnique(id);
      if (!wallet) return null;

      const [trx, token] = await Promise.all([tron.getTrxBalance(wallet.address), tron.getTokenBalance(wallet.address)]);

      const assets: AssetsSnapshotDto = { coins: { trx }, tokens: { [tokenSymbol]: token } };
      await this.repo.snapshot(wallet.id, assets);

      return assets;
    } catch (error) {
      mapPrismaError(error);
    }
  }

  private getPrivateKey(encryptedPrivateKey: string): string {
    const pk = decryptPrivateKey(encryptedPrivateKey, this.env.walletMasterKey);
    return pk;
  }

  async transferToken(encryptedPrivateKey: string, toAddress: string, amount: number): Promise<string> {
    const privateKey = this.getPrivateKey(encryptedPrivateKey);
    return this.tronService.transferToken(privateKey, toAddress, amount);
  }

  async transferTrx(encryptedPrivateKey: string, toAddress: string, amount: number): Promise<string> {
    const privateKey = this.getPrivateKey(encryptedPrivateKey);
    return this.tronService.transferTrx(privateKey, toAddress, amount);
  }
}
