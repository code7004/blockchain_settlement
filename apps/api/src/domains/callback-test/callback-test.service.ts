import { PAGINATION_DEFAULT_LIMIT, PAGINATION_MAX_LIMIT } from '@/core/constants';
import { PrismaService } from '@/infra/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CallbackHeaders, DepositConfirmedCallbackBody } from '../callback/callback.types';
import { GetCallbackTestQueryDto } from './dto/get-callback-test.query.dto';

@Injectable()
export class CallbackTestService {
  constructor(private readonly prisma: PrismaService) {}

  async save(body: DepositConfirmedCallbackBody, headers: CallbackHeaders) {
    await this.prisma.callbackTestLog.create({
      data: {
        body,
        headers,
        signature: headers['x-signature'] ?? null,
      },
    });
  }

  async findAll(query: GetCallbackTestQueryDto) {
    const limit = Math.min(query.limit ?? PAGINATION_DEFAULT_LIMIT, PAGINATION_MAX_LIMIT);
    const offset = query.offset ?? 0;

    const where = {};

    const [data, total] = await this.prisma.$transaction([
      this.prisma.callbackTestLog.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.callbackTestLog.count({ where }),
    ]);
    return { data, total, limit, offset };
  }
}
