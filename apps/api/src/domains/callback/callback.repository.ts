/**
 * callback.repository.ts
 * callback_logs 생성/수정 전담
 * Prisma 예외는 mapPrismaError 사용
 */
import { PAGINATION_DEFAULT_LIMIT, PAGINATION_MAX_LIMIT } from '@/core/constants';
import { mapPrismaError } from '@/core/errors/prisma-exception.mapper';
import { PrismaService } from '@/infra/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CallbackStatus, Prisma } from '@prisma/client';
import { GetCallbackQueryDto } from './dto/get-callback.query.dto';
import { RetryFailedAllBodyDto, RetryFailedIdsBodyDto } from './dto/retry.dto';
import { UpdateCallbackDto } from './dto/update.callback.dto';

@Injectable()
export class CallbackRepository {
  constructor(private readonly prisma: PrismaService) {}

  async update(id: string, data: UpdateCallbackDto) {
    return await this.prisma.callbackLog.update({ where: { id }, data });
  }

  async updateAttempt(id: string, data: { writer: string; attemptCount: number; requestSignature?: string; reason?: string; status?: CallbackStatus; lastStatusCode?: number; lastAttemptAt?: Date }) {
    try {
      return await this.prisma.callbackLog.update({ where: { id }, data });
    } catch (error: unknown) {
      mapPrismaError(error);
    }
  }

  async findAll(dto: GetCallbackQueryDto) {
    const limit = Math.min(dto.limit ?? PAGINATION_DEFAULT_LIMIT, PAGINATION_MAX_LIMIT);
    const offset = dto.offset ?? 0;

    const where: Prisma.CallbackLogWhereInput = { partnerId: dto.partnerId };
    if (dto.id) where.id = dto.id;
    if (dto.status) where.status = dto.status;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.callbackLog.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.callbackLog.count({ where }),
    ]);
    return { data, total, limit, offset };
  }

  /**
   * 실패 목록만 리턴하면 최대 100개 고정
   * @returns
   */
  async findAllUnSucces() {
    const limit = 100;

    return this.prisma.callbackLog.findMany({
      where: { status: CallbackStatus.PENDING, attemptCount: { lt: 3 } },
      include: { partner: true },
      take: limit,
      orderBy: { createdAt: 'asc' },
    });
  }
  async findByTxHash(txHash: string) {
    return await this.prisma.callbackLog.findUnique({ where: { txHash } });
  }

  async retryFailedIds(dto: RetryFailedIdsBodyDto) {
    const { ids, partnerId } = dto;

    if (!ids || ids.length === 0) {
      return { count: 0 };
    }

    // 안전장치: 최대 1000개 제한
    const targetIds = ids.slice(0, 1000);

    const result = await this.prisma.callbackLog.updateMany({
      where: { id: { in: targetIds }, status: CallbackStatus.FAILED, partnerId },
      data: { status: CallbackStatus.PENDING, attemptCount: 0, lastAttemptAt: null },
    });

    return {
      requested: targetIds.length,
      updated: result.count,
    };
  }

  async retryFailedAll(body: RetryFailedAllBodyDto) {
    const result = await this.prisma.callbackLog.updateMany({
      where: {
        status: CallbackStatus.FAILED,
        partnerId: body.partnerId,
      },
      data: {
        status: CallbackStatus.PENDING,
        attemptCount: 0,
      },
    });

    return { count: result.count };
  }
}
