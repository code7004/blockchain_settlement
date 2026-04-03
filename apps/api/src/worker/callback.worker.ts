import { EnvService } from '@/core/env/env.service';
import { CallbackService } from '@/domains/callback/callback.service';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { CallbackStatus } from '@prisma/client';
import axios from 'axios';

const CALLBACK_MAX_ATTEMPTS = 3;

@Injectable()
export class CallbackWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CallbackWorker.name);
  private timer: NodeJS.Timeout | null = null;
  private pollInterval = 10000000;

  constructor(
    private readonly env: EnvService,
    private readonly service: CallbackService,
  ) {
    this.pollInterval = this.env.getPollInterval('callback');
  }

  onModuleInit() {
    this.start();
  }

  onModuleDestroy() {
    this.stop();
  }

  private start() {
    if (this.timer) return;

    this.logger.log(`STARTED interval=${this.pollInterval}ms---------------------`);

    this.timer = setInterval(() => {
      void this.process().catch((e) => {
        this.logger.error(`tick failed: ${e instanceof Error ? e.message : String(e)}`);
      });
    }, this.pollInterval);

    void this.process().catch((e) => {
      this.logger.error(`initial tick failed: ${e instanceof Error ? e.message : String(e)}`);
    });
  }

  private stop() {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
    this.logger.log('CallbackWorker stopped.');
  }

  async process() {
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
        });

        this.logger.log(`Callback success deposit=${job.depositId} attempt=${attempt}`);
      } catch (error: unknown) {
        this.logger.warn(`Callback retry deposit=${job.depositId} attempt=${attempt}`);

        let statusCode: string | undefined;

        if (typeof error === 'object' && error !== null && 'status' in error) {
          statusCode = String(error.status);
        }

        if (attempt >= CALLBACK_MAX_ATTEMPTS) {
          await this.service.updateAttempt(job.id, {
            attemptCount: attempt,
            status: CallbackStatus.FAILED,
            lastAttemptAt: new Date(),
            lastStatusCode: Number(statusCode),
          });

          this.logger.error(`Callback failed permanently deposit=${job.depositId}`);
          continue;
        }

        await this.service.updateAttempt(job.id, {
          attemptCount: attempt,
          lastAttemptAt: new Date(),
        });
      }
    }
  }
}
