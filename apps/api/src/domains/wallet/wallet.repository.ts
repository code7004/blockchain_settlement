import { PAGINATION_DEFAULT_LIMIT, PAGINATION_MAX_LIMIT } from '@/core/constants';
import { PrismaService } from '@/infra/prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { Prisma, WalletStatus } from '@prisma/client';
import { AssetsSnapshotDto } from './dto/assets.snapshot.dto';
import { CreateReclaimJobsDto } from './dto/create-reclaim-jobs.dto';
import { GetWalletsQueryDto } from './dto/get-wallets.query.dto';

@Injectable()
export class WalletRepository {
  private readonly logger = new Logger(WalletRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: GetWalletsQueryDto) {
    const limit = Math.min(query.limit ?? PAGINATION_DEFAULT_LIMIT, PAGINATION_MAX_LIMIT);
    const offset = query.offset ?? 0;

    const { partnerId, keyword, status } = query;
    const where: Prisma.WalletWhereInput = {};
    if (partnerId) where.partnerId = partnerId;
    if (status) where.status = status;

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
          assetsSnapshot: true,
          user: { select: { externalUserId: true } },
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.wallet.count({ where }),
    ]);
    return { data, total, limit, offset };
  }

  async findUnique(id: string) {
    return this.prisma.wallet.findUnique({ where: { id } });
  }

  async findByAddress(address: string) {
    return this.prisma.wallet.findUnique({ where: { address } });
  }

  async findByIds(ids: string[]) {
    // 최대 1000개 가능

    return this.prisma.wallet.findMany({ where: { id: { in: ids } } });
  }

  async findActiveWallets() {
    // 최대 1000개 가능
    return this.prisma.wallet.findMany({ where: { status: WalletStatus.ACTIVE } });
  }

  async createReclaimJobsAll(params: CreateReclaimJobsDto) {
    const { partnerId, ids, status } = params;

    const statusCondition = status ? Prisma.sql`AND w.status = ${status}::"WalletStatus"` : Prisma.empty;

    const idCondition = ids && ids.length > 0 ? Prisma.sql`AND w.id = ANY(${ids}::uuid[])` : Prisma.empty;

    return await this.prisma.$executeRaw`
    INSERT INTO "AssetsReclaimJob" ("walletId")
    SELECT w.id
    FROM "Wallet" w
    WHERE w."partnerId" = ${partnerId}::uuid
      ${statusCondition}
      ${idCondition}
      AND NOT EXISTS (
        SELECT 1
        FROM "AssetsReclaimJob" j
        WHERE j."walletId" = w.id
          AND j.status IN ('PENDING', 'PROCESSING')
      )
  `;
  }

  async snapshot(id: string, assetsSnapshot: AssetsSnapshotDto) {
    return await this.prisma.wallet.update({ where: { id }, data: { assetsSnapshot } });
  }
}
