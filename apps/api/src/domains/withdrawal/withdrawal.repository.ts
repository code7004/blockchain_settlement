import { PrismaService } from '@/infra/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class WithdrawalRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.WithdrawalUncheckedCreateInput) {
    return this.prisma.withdrawal.create({ data });
  }

  async findMany(params: { where?: Prisma.WithdrawalWhereInput; skip?: number; take?: number }) {
    return this.prisma.withdrawal.findMany({ where: params.where, skip: params.skip, take: params.take, orderBy: { createdAt: 'desc' } });
  }

  async count(where?: Prisma.WithdrawalWhereInput) {
    return this.prisma.withdrawal.count({ where });
  }
}
