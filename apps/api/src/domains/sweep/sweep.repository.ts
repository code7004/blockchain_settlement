/**
 * callback.repository.ts
 * callback_logs 생성/수정 전담
 * Prisma 예외는 mapPrismaError 사용
 */
import { PAGINATION_DEFAULT_LIMIT, PAGINATION_MAX_LIMIT } from '@/core/constants';
import { PrismaService } from '@/infra/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { GetSweepQueryDto } from './dto/get-sweep.query.dto';

@Injectable()
export class SweepRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(dto: GetSweepQueryDto) {
    const limit = Math.min(dto.limit ?? PAGINATION_DEFAULT_LIMIT, PAGINATION_MAX_LIMIT);
    const offset = dto.offset ?? 0;

    const where: Prisma.SweepLogWhereInput = { partnerId: dto.partnerId };
    if (dto.id) where.id = dto.id;
    if (dto.status) where.status = dto.status;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.sweepLog.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.sweepLog.count({ where }),
    ]);
    return { data, total, limit, offset };
  }
}
