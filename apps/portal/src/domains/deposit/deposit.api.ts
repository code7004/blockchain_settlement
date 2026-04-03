// deposit.api.ts
import { apiget, removeUndefined, type GetTableQueryDto, type IApiResponse } from '@/core/network';
import type { Deposit } from '@prisma/client';

export enum DepositStatus {
  DETECTED = 'DETECTED',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
}

export type DepositDto = Deposit;

export interface GetDepositsQueryDto extends GetTableQueryDto {
  partnerId: string;
  txHash?: string;
}

export function apiGetDeposits(params?: GetDepositsQueryDto) {
  return apiget<IApiResponse<DepositDto[]>>('/portal/deposits', removeUndefined(params));
}
