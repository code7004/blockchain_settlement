import { mapPrismaError } from '@/core/errors/prisma-exception.mapper';
import { Injectable } from '@nestjs/common';
import { Prisma, WithdrawalStatus } from '@prisma/client';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { GetWithdrawalsQueryDto } from './dto/get-withdrawals.query.dto';
import { WithdrawalRepository } from './withdrawal.repository';

@Injectable()
export class WithdrawalService {
  constructor(private readonly repo: WithdrawalRepository) {}

  async create(dto: CreateWithdrawalDto) {
    const now = new Date();

    try {
      return await this.repo.create({
        partnerId: dto.partnerId,
        userId: dto.userId,
        walletId: dto.walletId,
        tokenSymbol: dto.tokenSymbol,
        tokenContract: dto.tokenContract,
        toAddress: dto.toAddress,
        amount: dto.amount,

        status: WithdrawalStatus.REQUESTED,

        requestedAt: now,
      });
    } catch (err) {
      mapPrismaError(err);
    }
  }

  async findAll(query: GetWithdrawalsQueryDto) {
    const where: Prisma.WithdrawalWhereInput = {};

    if (query.partnerId) {
      where.partnerId = query.partnerId;
    }

    if (query.status) {
      where.status = query.status;
    }

    const [data, total] = await Promise.all([
      this.repo.findMany({
        where,
        skip: query.offset,
        take: query.limit,
      }),
      this.repo.count(where),
    ]);

    return {
      data,
      total,
      limit: query.limit,
      offset: query.offset,
    };
  }
}
