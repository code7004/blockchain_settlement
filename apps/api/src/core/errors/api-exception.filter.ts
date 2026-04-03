import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
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

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message, code } = this.extractException(exception);

    // 🔹 로그 레벨 분기
    if (status === (HttpStatus.NOT_FOUND as number)) {
      this.logger.warn('[404 NOT FOUND]', {
        method: request.method,
        url: request.originalUrl,
        query: request.query,
        ip: request.ip,
      });
    } else if (status >= 500) {
      this.logger.error('[SERVER ERROR]', {
        method: request.method,
        url: request.originalUrl,
        message,
        stack: exception instanceof Error ? exception.stack : undefined,
      });
    } else {
      this.logger.warn('[HTTP ERROR]', {
        status,
        method: request.method,
        url: request.originalUrl,
        message,
      });
    }

    const errorResponse: ApiErrorResponse = {
      statusCode: status,
      code,
      message,
      timestamp: new Date().toISOString(),
      path: request.originalUrl,
    };

    response.status(status).json(errorResponse);
  }

  /**
   * Exception → 표준 형태로 변환
   */
  private extractException(exception: unknown): {
    status: number;
    message: string;
    code: string;
  } {
    // ✅ HttpException
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse() as HttpExceptionResponse;

      const { message, code } = this.normalizeException(res);

      return { status, message, code };
    }

    // ❗ 예상 못한 에러 (500)
    if (exception instanceof Error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: exception.message ?? 'Internal Server Error',
        code: 'INTERNAL_SERVER_ERROR',
      };
    }

    // ❗ 완전 unknown
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Unknown error',
      code: 'UNKNOWN_ERROR',
    };
  }

  /**
   * HttpExceptionResponse normalize
   */
  private normalizeException(res: HttpExceptionResponse): {
    message: string;
    code: string;
  } {
    if (typeof res === 'string') {
      return {
        message: res,
        code: 'UNKNOWN_ERROR',
      };
    }

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
