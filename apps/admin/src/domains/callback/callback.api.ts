import { get, post, type IApiPagenationQuery, type IApiResponse } from '@/core/network';
import { removeUndefined } from '@/core/network/api.utils';

export interface ICallbackGetQuery extends IApiPagenationQuery {
  partnerId: string;
  depositId?: string;
  status?: string;
}
export interface ICallback {
  id: string;

  partnerId: string;
  depositId: string;

  eventType: string;

  callbackUrl: string;

  requestBody: string;
  requestSignature: string;

  attemptCount: number;
  maxAttempts: number;

  lastStatusCode: number | null;

  status: string;

  lastAttemptAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export function fetchAdminCallbacks(params?: ICallbackGetQuery) {
  return get<IApiResponse<ICallback[]>>('/api/admin/callbacks', removeUndefined(params));
}

export interface IpostRetryIds {
  partnerId: string;
  ids?: string[];
}
export function postCallbackRetryIds(body?: IpostRetryIds) {
  return post<IApiResponse<ICallback[]>>('/api/admin/callbacks/retry/ids', removeUndefined(body));
}

export interface IpostRetryAll {
  partnerId: string;
}

export function postCallbackRetryAll(body?: IpostRetryAll) {
  return post<IApiResponse<ICallback[]>>('/api/admin/callbacks/retry-failed', removeUndefined(body));
}
