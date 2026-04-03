import { apiget, apipatch, apipost, type GetTableQueryDto, type IApiResponse } from '@/core/network';
import { removeUndefined } from '@/core/network/api.utils';
import type { CallbackLog } from '@prisma/client';

export enum CallbackStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export type CallbackDto = CallbackLog;

export interface CallbackGetDto extends Pick<CallbackDto, 'partnerId'>, GetTableQueryDto {
  id?: string;
  status?: CallbackStatus;
}

export interface CallbackRetryIdsDto extends Pick<CallbackDto, 'partnerId'> {
  ids?: string[];
}

export type CallbackRetryAllDto = Pick<CallbackDto, 'partnerId'>;

export type CallbackPatchDto = Pick<CallbackDto, 'callbackUrl'>;

export function apiGetCallbacks(params?: CallbackGetDto) {
  return apiget<IApiResponse<CallbackDto[]>>('/portal/callbacks', removeUndefined(params));
}

export function apiPostCallbackRetryIds(body?: CallbackRetryIdsDto) {
  return apipost<IApiResponse<CallbackDto[]>>('/portal/callbacks/retry/ids', removeUndefined(body));
}

export function apiPostCallbackRetryAll(body?: CallbackRetryAllDto) {
  return apipost<IApiResponse<CallbackDto[]>>('/portal/callbacks/retry-failed', removeUndefined(body));
}

export function apiPatchCallback(id: string, dto: CallbackPatchDto) {
  return apipatch(`/portal/callbacks/${id}`, dto);
}
