import { apidelete, apiget, apipatch, removeUndefined, type IApiResponse } from '@/core/network';

export enum ExceptionLogStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
}

export interface ExceptionLogListDto {
  id: string;
  message: string;
  path?: string | null;
  method?: string | null;
  status: ExceptionLogStatus;
  assigneeMemberId?: string | null;
  assigneeMemberUsername?: string | null;
  writer?: string | null;
  createdAt: string;
}

export interface ExceptionLogDetailDto extends ExceptionLogListDto {
  stack?: string | null;
}

export interface GetExceptionLogsQueryDto {
  offset: number;
  limit?: number;
  message?: string;
  path?: string;
  method?: string;
  status?: ExceptionLogStatus;
}

export function apiGetExceptionLogs(params?: GetExceptionLogsQueryDto) {
  return apiget<IApiResponse<ExceptionLogListDto[]>>('/admin/exception-logs', removeUndefined(params));
}

export function apiGetExceptionLog(id: string) {
  return apiget<ExceptionLogDetailDto>(`/admin/exception-logs/${id}`);
}

export interface UpdateExceptionLogDto {
  status?: ExceptionLogStatus;
  assigneeMemberId?: string | null;
}

export function apiPatchExceptionLog(id: string, body: UpdateExceptionLogDto) {
  return apipatch(`/admin/exception-logs/${id}`, removeUndefined(body));
}

export function apiDeleteExceptionLog(id: string) {
  return apidelete(`/admin/exception-logs/${id}`);
}
