import { apiget } from '@/core/network';

export interface IAdminBalance {
  balance: {
    raw: number;
    token: number;
  };
  depositSum: {
    raw: number;
    token: number;
  };
  withdrawalSum: {
    raw: number;
    token: number;
  };
  confirmedDeposits: number;
  broadcastedWithdrawals: number;
}

export function apiGetAdminBalances() {
  return apiget<IAdminBalance>('/portal/balance/admin');
}
