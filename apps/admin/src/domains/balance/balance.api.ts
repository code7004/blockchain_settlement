import { get } from '@/core/network';

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

export function fetchAdminBalances() {
  return get<IAdminBalance>('/api/admin/balance/admin');
}
