import { CALLBACK_EVENT_TYPE, CONFIRMATION_COUNT } from '@/core/constants';
import { EnvService } from '@/core/env/env.service';
import { mapPrismaError } from '@/core/errors/prisma-exception.mapper';
import { PrismaService } from '@/infra/prisma/prisma.service';
import { TronService } from '@/infra/tron/tron.service';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { CallbackStatus, DepositStatus } from '@prisma/client';

@Injectable()
export class ConfirmWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ConfirmWorker.name);
  private timer: NodeJS.Timeout | null = null;
  private pollInterval = 10000000;

  constructor(
    private readonly env: EnvService,
    private readonly prisma: PrismaService,
    private readonly tronService: TronService,
  ) {
    this.pollInterval = this.env.getPollInterval('confirm');
  }

  onModuleInit() {
    this.start();
  }

  onModuleDestroy() {
    // 서버 종료 시 watcher 정리
    this.stop();
  }

  private start() {
    if (this.timer) return;

    this.logger.log(`STARTED interval=${this.pollInterval}ms ---------------------------`);

    this.timer = setInterval(() => {
      void this.process().catch((e) => {
        // watcher는 죽지 않고 다음 tick으로 넘어가야 함
        this.logger.error(`tick failed: ${e instanceof Error ? e.message : String(e)}`);
      });
    }, this.pollInterval);

    // 즉시 1회 실행 (기동 직후 확인 용이)
    void this.process().catch((e) => {
      this.logger.error(`initial tick failed: ${e instanceof Error ? e.message : String(e)}`);
    });
  }

  private stop() {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
    this.logger.log('ConfirmWatcher stopped.');
  }

  async process(): Promise<void> {
    const latestBlock = await this.tronService.getLatestBlockNumber();

    const deposits = await this.prisma.deposit.findMany({
      where: {
        status: DepositStatus.DETECTED,
        blockNumber: { lte: latestBlock - CONFIRMATION_COUNT },
      },
      include: { partner: true, user: true },
    });

    for (const deposit of deposits) {
      try {
        const result = await this.prisma.deposit.updateMany({
          where: { id: deposit.id, status: DepositStatus.DETECTED },
          data: { status: DepositStatus.CONFIRMED, confirmedAt: new Date() },
        });

        if (result.count === 0) continue;

        this.logger.log(`Deposit confirmed: ${deposit.id}`);

        // callback job 생성
        await this.prisma.callbackLog.create({
          data: {
            partnerId: deposit.partnerId,
            depositId: deposit.id,
            txHash: deposit.txHash,
            eventType: CALLBACK_EVENT_TYPE.CONFIRMED,
            callbackUrl: deposit.partner.callbackUrl,
            requestBody: JSON.stringify({ txHash: deposit.txHash, amount: deposit.amount }),
            requestSignature: '',
            attemptCount: 0,
            maxAttempts: 3,
            status: CallbackStatus.PENDING,
          },
        });
      } catch (error: unknown) {
        mapPrismaError(error);
      }
    }
  }
}
