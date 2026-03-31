import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import type { Request, Response } from 'express';

type HttpExceptionResponse =
  | string
  | {
      message?: string | string[];
      error?: string;
      code?: string;
    };

interface ApiErrorResponse {
  statusCode: number;
  code: string;
  message: string;
  timestamp: string;
  path: string;
}

@Catch(HttpException)
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as HttpExceptionResponse;

    const { message, code } = this.normalizeException(exceptionResponse);

    const errorResponse: ApiErrorResponse = {
      statusCode: status,
      code,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }

  private normalizeException(res: HttpExceptionResponse): { message: string; code: string } {
    // string 형태
    if (typeof res === 'string') {
      return {
        message: res,
        code: 'UNKNOWN_ERROR',
      };
    }

    // message 처리
    let message = 'Unknown error';

    if (Array.isArray(res.message)) {
      message = res.message.join(', ');
    } else if (typeof res.message === 'string') {
      message = res.message;
    }

    return {
      message,
      code: res.code ?? res.error ?? 'UNKNOWN_ERROR',
    };
  }
}
