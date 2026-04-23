export interface CreateExceptionLogInput {
  source: string;
  statusCode: number;
  errorName?: string;
  message: string;
  stack?: string;
  method?: string;
  path?: string;
  workerName?: string;
  jobId?: string;
  depositId?: string;
  partnerId?: string;
  writer?: string;
}

export interface CaptureApiExceptionInput {
  exception: unknown;
  statusCode: number;
  method: string;
  path: string;
}

export interface CaptureWorkerExceptionInput {
  exception: unknown;
  workerName: string;
  jobId?: string;
  depositId?: string;
  partnerId?: string;
}
