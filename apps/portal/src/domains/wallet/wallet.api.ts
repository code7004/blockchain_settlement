import { apiget, apipost, removeUndefined, type GetTableQueryDto, type IApiResponse } from '@/core/network';
import type { Wallet } from '@prisma/client';

export enum WalletStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export interface WalletDto extends Wallet {
  user: {
    externalUserId: string;
  };
}

export interface IapiGetWallets extends GetTableQueryDto {
  partnerId: string;
  keyword?: string;
  status?: WalletStatus;
}

export interface CreateReclaimJobsDto {
  partnerId: string;
  ids?: string[];
  status?: WalletStatus;
}

export type WalletGetDto = Pick<WalletDto, 'partnerId'> & GetTableQueryDto;

export function apiGetWallets(params?: IapiGetWallets) {
  return apiget<IApiResponse<WalletDto[]>>('/portal/wallets', removeUndefined(params));
}

export function apiGetAssets(id: string) {
  return apiget(`/portal/wallets/${id}/assets`);
}

export function apiAssetsReclaim(dto: CreateReclaimJobsDto) {
  return apipost<{ data: number }>('/portal/wallets/assets-reclaim', removeUndefined(dto));
}
