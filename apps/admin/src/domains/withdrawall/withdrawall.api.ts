import { get, type IApiResponse } from '@/core/network';
import { removeUndefined } from '@/core/network/api.utils';
import type { IPartnerIdQuery } from '../partner/partner.api';

export interface IWithdrawal {
  id: string;

  partnerId: string;
  userId: string;
  walletId: string;

  tokenSymbol: string;
  tokenContract: string;

  toAddress: string;
  amount: string;

  txHash: string | null;
  blockNumber: number | null;

  status: string;

  failReason: string | null;

  requestedAt: Date;
  approvedAt: Date | null;
  broadcastedAt: Date | null;

  createdAt: Date;
}

export function fetchAdminWithdrawals(params?: IPartnerIdQuery) {
  return get<IApiResponse<IWithdrawal[]>>('/api/admin/withdrawals', removeUndefined(params));
}
