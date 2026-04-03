import { apiget, removeUndefined, type GetTableQueryDto, type IApiResponse } from '@/core/network';

export enum WalletStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export interface WalletDto {
  id: string;
  partnerId: string;
  userId: string;
  address: string;
  status: WalletStatus;
  createdAt: Date;
  updatedAt: Date;
  user: {
    externalUserId: string;
  };
}

export interface IapiGetWallets extends GetTableQueryDto {
  partnerId: string;
  keyword?: string;
  status?: string;
}

export type WalletGetDto = Pick<WalletDto, 'partnerId'> & GetTableQueryDto;

export function apiGetWallets(params?: IapiGetWallets) {
  return apiget<IApiResponse<WalletDto[]>>('/portal/wallets', removeUndefined(params));
}
