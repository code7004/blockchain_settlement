import { apiget, type GetTableQueryDto, type IApiResponse } from '@/core/network';
import { removeUndefined } from '@/core/network/api.utils';
import type { SweepLog } from '@prisma/client';

export type SweepDto = SweepLog;

export enum SweepStatus {
  PENDING = 'PENDING',
  BROADCASTED = 'BROADCASTED',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED',
}

export interface GetSweepQueryDto extends Pick<SweepDto, 'partnerId'>, GetTableQueryDto {
  id?: string;
  status?: SweepStatus;
}

export function apiGetSweeps(params?: GetSweepQueryDto) {
  return apiget<IApiResponse<SweepDto[]>>('/portal/sweeps', removeUndefined(params));
}
