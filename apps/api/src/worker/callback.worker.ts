import { EnvService } from '@/core/env/env.service';
import { CallbackService } from '@/domains/callback/callback.service';
import { Injectable } from '@nestjs/common';
import { CallbackStatus } from '@prisma/client';
import axios from 'axios';
import { BaseWorker } from './base.worker';

const CALLBACK_MAX_ATTEMPTS = 3;

@Injectable()
export class CallbackWorker extends BaseWorker {
  constructor(
    private readonly env: EnvService,
    private readonly service: CallbackService,
  ) {
    super('CallbackWorker', env.getPollInterval('callback'));
  }

  async process(): Promise<void> {
    const callbacks = await this.service.findAllUnSucces();

    for (const job of callbacks) {
      const attempt = job.attemptCount + 1;

      try {
        // signature 생성 (HMAC-SHA256)
        const signature = this.service.generateSignature(job.requestBody, job.partner.callbackSecret);
        const response = await axios.post(job.callbackUrl, JSON.parse(job.requestBody), {
          headers: {
            'Content-Type': 'application/json',
            'X-Signature': signature,
          },
          timeout: 5000,
        });

        await this.service.updateAttempt(job.id, {
          attemptCount: attempt,
          status: CallbackStatus.SUCCESS,
          requestSignature: signature,
          lastStatusCode: response.status,
          lastAttemptAt: new Date(),
          writer: this.env.name,
        });

        this.logger.log(`Callback success deposit=${job.depositId} attempt=${attempt}`);
      } catch (error: unknown) {
        this.logger.warn(`Callback retry deposit=${job.depositId} attempt=${attempt}`);

        let statusCode: string | undefined;
        let reason: string | undefined;

        if (typeof error === 'object' && error !== null && 'status' in error && 'message' in error) {
          statusCode = String(error.status);
          reason = String(error.message);
        }

        if (attempt >= CALLBACK_MAX_ATTEMPTS) {
          await this.service.updateAttempt(job.id, {
            attemptCount: attempt,
            status: CallbackStatus.FAILED,
            reason,
            writer: this.env.name,
            lastAttemptAt: new Date(),
            lastStatusCode: Number(statusCode),
          });

          this.logger.error(`Callback failed permanently deposit=${job.depositId}`);
          continue;
        }

        await this.service.updateAttempt(job.id, {
          attemptCount: attempt,
          writer: this.env.name,
          lastAttemptAt: new Date(),
        });
      }
    }
  }
}
