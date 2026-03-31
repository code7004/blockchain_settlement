import { Injectable } from '@nestjs/common';
import { createHmac } from 'crypto';

import { CallbackRepository } from './callback.repository';

import { CallbackStatus } from '@prisma/client';
import { GetCallbackQueryDto } from './dto/get-callback.query.dto';
import { RetryFailedAllBodyDto, RetryFailedIdsBodyDto } from './dto/retry.dto';

@Injectable()
export class CallbackService {
  constructor(private readonly repo: CallbackRepository) {}

  generateSignature(payload: string, secret: string): string {
    return createHmac('sha256', secret).update(payload).digest('hex');
  }

  async findAll(query: GetCallbackQueryDto) {
    return this.repo.findAll(query);
  }

  async findByTxHash(txHash: string) {
    return await this.repo.findByTxHash(txHash);
  }

  async updateAttempt(id: string, data: { attemptCount: number; requestSignature?: string; status?: CallbackStatus; lastStatusCode?: number; lastAttemptAt?: Date }) {
    return await this.repo.updateAttempt(id, data);
  }

  async findAllUnSucces() {
    return await this.repo.findAllUnSucces();
  }

  async retryFailedAll(body: RetryFailedAllBodyDto) {
    return this.repo.retryFailedAll(body);
  }

  async retryFailedIds(body: RetryFailedIdsBodyDto) {
    return this.repo.retryFailedIds(body);
  }
}
