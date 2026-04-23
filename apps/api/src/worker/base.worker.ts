import { Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

export abstract class BaseWorker implements OnModuleInit, OnModuleDestroy {
  protected readonly logger: Logger;
  private timer: NodeJS.Timeout | null = null;

  constructor(
    protected readonly name: string,
    protected readonly pollInterval: number,
  ) {
    this.logger = new Logger(name);
  }

  onModuleInit() {
    if (this.timer) return;

    this.logger.log(`STARTED interval=${this.pollInterval}ms ---------------------------`);

    this.timer = setInterval(() => {
      void this.safeProcess();
    }, this.pollInterval);

    // 최초 1회 실행
    void this.safeProcess();
  }

  onModuleDestroy() {
    if (!this.timer) return;

    clearInterval(this.timer);
    this.timer = null;

    this.logger.log(`${this.name} stopped.`);
  }

  private isRunning = false;

  private async safeProcess() {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      await this.process();
    } catch (e) {
      this.logger.error(e);
    } finally {
      this.isRunning = false;
    }
  }

  // 자식에서 구현
  protected abstract process(): Promise<void>;
}
