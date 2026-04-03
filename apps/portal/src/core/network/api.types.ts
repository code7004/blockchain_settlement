// 서버 응답 공통 포맷
export interface IApiResponse<T> {
  success: boolean;
  status: string;
  data: T;
  limit: number;
  offset: number;
  total: number;
  message: string;
}

export interface GetTableQueryDto {
  limit?: number;
  offset?: number;
  keyword?: string;
}

export interface IApiError {
  statusCode: number;
  message: string;
  error?: string;
  path?: string;
  timestamp?: string;
}
