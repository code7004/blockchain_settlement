import { get, removeUndefined, type IApiPagenationQuery, type IApiResponse } from '@/core/network';

export interface IDepositGetQuery extends IApiPagenationQuery {
  partnerId: string;
  txHash?: string;
}

export interface IDeposit {
  id: string;
  partnerId: string;
  userId: string;
  walletId: string;
  tokenSymbol: string;
  tokenContract: string;
  txHash: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
  blockNumber: number;
  status: string;
  detectedAt: Date;
  confirmedAt: Date;
  createdAt: Date;
}

export function fetchAdminDeposits(params?: IDepositGetQuery) {
  return get<IApiResponse<IDeposit[]>>('/api/admin/deposits', removeUndefined(params));
}
