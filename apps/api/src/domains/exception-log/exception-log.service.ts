import { EnvService } from '@/core/env/env.service';
import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ExceptionLogStatus, MemberRole } from '@prisma/client';
import { GetExceptionLogsQueryDto } from './dto/get-exception-logs.query.dto';
import { AssignExceptionLogDto, UpdateExceptionLogStatusDto } from './dto/update-exception-log.dto';
import { ExceptionLogRepository } from './exception-log.repository';
import { CaptureApiExceptionInput, CaptureWorkerExceptionInput, CreateExceptionLogInput } from './exception-log.types';

const MAX_MESSAGE_LENGTH = 2000;
const MAX_STACK_LENGTH = 8000;
const INTERNAL_SERVER_ERROR_STATUS = 500;
const SOFT_DELETE_MIN_AGE_DAYS = 30;

@Injectable()
export class ExceptionLogService {
  private readonly logger = new Logger(ExceptionLogService.name);

  constructor(
    private readonly repository: ExceptionLogRepository,
    private readonly env: EnvService,
  ) {}

  async findAll(query: GetExceptionLogsQueryDto) {
    return this.repository.findAll(query);
  }

  async findOne(id: string) {
    return this.repository.findOne(id);
  }

  async updateStatus(id: string, dto: UpdateExceptionLogStatusDto) {
    await this.ensureActive(id);
    return this.repository.updateStatus(id, dto.status);
  }

  async assign(id: string, dto: AssignExceptionLogDto) {
    await this.ensureActive(id);
    return this.repository.assign(id, dto.assignedTo ?? null);
  }

  async softDelete(id: string, role?: MemberRole) {
    if (role !== MemberRole.OWNER) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Only OWNER can delete exception logs',
      });
    }

    const target = await this.repository.findDeleteTarget(id);

    if (!target) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: 'Exception log not found',
      });
    }

    if (target.status !== ExceptionLogStatus.RESOLVED) {
      throw new BadRequestException({
        code: 'EXCEPTION_LOG_NOT_RESOLVED',
        message: 'Only RESOLVED exception logs can be deleted',
      });
    }

    const threshold = new Date();
    threshold.setDate(threshold.getDate() - SOFT_DELETE_MIN_AGE_DAYS);

    if (target.createdAt >= threshold) {
      throw new BadRequestException({
        code: 'EXCEPTION_LOG_TOO_RECENT',
        message: 'Only exception logs older than 30 days can be deleted',
      });
    }

    return this.repository.softDelete(id);
  }

  private async ensureActive(id: string): Promise<void> {
    const found = await this.repository.findDeleteTarget(id);

    if (!found) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: 'Exception log not found',
      });
    }
  }

  async captureApiException(input: CaptureApiExceptionInput): Promise<void> {
    if (input.statusCode !== INTERNAL_SERVER_ERROR_STATUS) {
      return;
    }

    await this.createSafely({
      source: 'API_FILTER',
      statusCode: input.statusCode,
      method: input.method,
      path: input.path,
      ...this.extractError(input.exception),
    });
  }

  async captureWorkerException(input: CaptureWorkerExceptionInput): Promise<void> {
    await this.createSafely({
      source: input.workerName,
      statusCode: INTERNAL_SERVER_ERROR_STATUS,
      workerName: input.workerName,
      jobId: input.jobId,
      depositId: input.depositId,
      partnerId: input.partnerId,
      ...this.extractError(input.exception),
    });
  }

  private async createSafely(input: CreateExceptionLogInput): Promise<void> {
    try {
      await this.repository.create({
        ...input,
        writer: this.env.name,
      });
    } catch (error: unknown) {
      this.logger.error('Failed to save exception log', error);
    }
  }

  private extractError(exception: unknown): Pick<CreateExceptionLogInput, 'errorName' | 'message' | 'stack'> {
    if (exception instanceof Error) {
      return {
        errorName: this.truncate(exception.name, 120),
        message: this.truncate(this.redact(exception.message || 'Internal Server Error'), MAX_MESSAGE_LENGTH),
        stack: exception.stack ? this.truncate(this.redact(exception.stack), MAX_STACK_LENGTH) : undefined,
      };
    }

    return {
      errorName: 'UnknownError',
      message: this.truncate(this.redact(String(exception) || 'Unknown error'), MAX_MESSAGE_LENGTH),
    };
  }

  private redact(value: string): string {
    return value.replace(/(privateKey|apiKey|callbackSecret|jwt|secret|token)=([^&\s]+)/gi, '$1=[REDACTED]').replace(/(WALLET_MASTER_KEY_BASE64|HOT_WALLET_PRIVATE_KEY|GAS_TANK_PRIVATE_KEY|JWT_SECRET)([^,\s]*)/gi, '$1=[REDACTED]');
  }

  private truncate(value: string, maxLength: number): string {
    if (value.length <= maxLength) {
      return value;
    }

    return value.slice(0, maxLength);
  }
}
