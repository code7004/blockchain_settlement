import { EnvService } from '@/core/env/env.service';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { SweepService } from '../domains/sweep/sweep.service';

@Injectable()
export class SweepWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SweepWorker.name);
  private timer: NodeJS.Timeout | null = null;
  private running = false;
  private pollInterval = 10000000;

  constructor(
    private readonly env: EnvService,
    private readonly sweepService: SweepService,
  ) {
    this.pollInterval = this.env.getPollInterval('sweep');
  }

  onModuleInit() {
    this.logger.log(`STARTED interval=${this.pollInterval}ms -----------------------------`);

    this.timer = setInterval(() => {
      if (this.running) return;

      this.execute().catch((err) => {
        this.logger.error('error', err);
      });
    }, this.pollInterval);
  }

  private async execute() {
    this.running = true;

    try {
      await this.sweepService.run();
    } finally {
      this.running = false;
    }
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
