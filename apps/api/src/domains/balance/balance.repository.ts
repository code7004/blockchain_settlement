import { PrismaService } from '@/infra/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { DepositStatus, WithdrawalStatus } from '@prisma/client';

@Injectable()
export class BalanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getConfirmedDepositSum(): Promise<number> {
    const result = await this.prisma.deposit.aggregate({
      _sum: { amount: true },
      where: { status: DepositStatus.CONFIRMED },
    });

    return Number(result._sum.amount ?? 0);
  }

  async getBroadcastedWithdrawalSum(): Promise<number> {
    const result = await this.prisma.withdrawal.aggregate({
      _sum: { amount: true },
      where: { status: WithdrawalStatus.BROADCASTED },
    });

    return Number(result._sum.amount ?? 0);
  }

  async getConfirmedDepositCount() {
    return this.prisma.deposit.count({
      where: { status: DepositStatus.CONFIRMED },
    });
  }

  async getBroadcastedWithdrawalCount() {
    return this.prisma.withdrawal.count({
      where: { status: WithdrawalStatus.BROADCASTED },
    });
  }
}
