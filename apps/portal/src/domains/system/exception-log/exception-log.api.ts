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
  assignedTo?: string | null;
  writer?: string | null;
  createdAt: string;
}

export interface ExceptionLogDetailDto extends ExceptionLogListDto {
  stack?: string | null;
}

export interface GetExceptionLogsQueryDto {
  page?: number;
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

export function apiPatchExceptionLogStatus(id: string, status: ExceptionLogStatus) {
  return apipatch(`/admin/exception-logs/${id}/status`, { status });
}

export function apiPatchExceptionLogAssign(id: string, assignedTo: string | null) {
  return apipatch(`/admin/exception-logs/${id}/assign`, { assignedTo });
}

export function apiDeleteExceptionLog(id: string) {
  return apidelete(`/admin/exception-logs/${id}`);
}
