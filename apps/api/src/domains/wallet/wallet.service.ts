import { PAGINATION_DEFAULT_LIMIT, PAGINATION_MAX_LIMIT } from '@/core/constants';
import { encryptPrivateKey } from '@/core/crypto/aes256';
import { EnvService } from '@/core/env/env.service';
import { mapPrismaError } from '@/core/errors/prisma-exception.mapper';
import { PrismaService } from '@/infra/prisma/prisma.service';
import { TronService } from '@/infra/tron/tron.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, WalletStatus } from '@prisma/client';
import { GetWalletsQueryDto } from './dto/get-wallets.query.dto';

@Injectable()
export class WalletService {
  constructor(
    private readonly prisma: PrismaService,
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

  async findAll(query: GetWalletsQueryDto) {
    const limit = Math.min(query.limit ?? PAGINATION_DEFAULT_LIMIT, PAGINATION_MAX_LIMIT);
    const offset = query.offset ?? 0;

    const { partnerId, keyword } = query;
    const where: Prisma.WalletWhereInput = {};
    if (partnerId) where.partnerId = partnerId;
    if (keyword?.trim()) {
      where.OR = [{ address: { contains: keyword, mode: 'insensitive' } }];
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.wallet.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          partnerId: true,
          userId: true,
          address: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          user: { select: { externalUserId: true } },
        },
      }),
      this.prisma.wallet.count({ where }),
    ]);
    return { data, total, limit, offset };
  }
}
