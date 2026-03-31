import { DepositModule } from '@/domains/deposit/deposit.module';
import { SweepModule } from '@/domains/sweep/sweep.module';
import { PrismaModule } from '@/infra/prisma/prisma.module';
import { TronModule } from '@/infra/tron/tron.module';
import { Module } from '@nestjs/common';
import { CallbackModule } from '../domains/callback/callback.module';
import { WalletModule } from '../domains/wallet/wallet.module';
import { CallbackWorker } from './callback.worker';
import { ConfirmWorker } from './confirm.worker';
import { DepositWorker } from './deposit.worker';
import { GasRefillWorker } from './gas-refill.worker';
import { SweepWorker } from './sweep.worker';

@Module({
  imports: [TronModule, PrismaModule, WalletModule, CallbackModule, DepositModule, SweepModule],
  providers: [DepositWorker, ConfirmWorker, CallbackWorker, GasRefillWorker, SweepWorker],
})
export class WorkerModule {}
