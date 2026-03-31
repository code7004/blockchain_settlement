import { formatTokenAmount } from '@/core/utils/token.util';
import { Injectable } from '@nestjs/common';
import { BalanceRepository } from './balance.repository';

@Injectable()
export class BalanceService {
  constructor(private readonly repo: BalanceRepository) {}

  async getBalance() {
    const depositSum = await this.repo.getConfirmedDepositSum();
    const withdrawalSum = await this.repo.getBroadcastedWithdrawalSum();

    const balance = depositSum - withdrawalSum;

    return {
      balance: formatTokenAmount(balance),
      depositSum: formatTokenAmount(depositSum),
      withdrawalSum: formatTokenAmount(withdrawalSum),
    };
  }

  async getAdminBalance() {
    const depositSum = await this.repo.getConfirmedDepositSum();
    const withdrawalSum = await this.repo.getBroadcastedWithdrawalSum();

    const confirmedDeposits = await this.repo.getConfirmedDepositCount();
    const broadcastedWithdrawals = await this.repo.getBroadcastedWithdrawalCount();

    const balance = depositSum - withdrawalSum;

    return {
      balance: formatTokenAmount(balance),
      depositSum: formatTokenAmount(depositSum),
      withdrawalSum: formatTokenAmount(withdrawalSum),
      confirmedDeposits,
      broadcastedWithdrawals,
    };
  }
}
