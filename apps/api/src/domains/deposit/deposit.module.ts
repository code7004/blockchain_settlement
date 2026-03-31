import { PrismaModule } from '@/infra/prisma/prisma.module';
import { TronModule } from '@/infra/tron/tron.module';
import { Module } from '@nestjs/common';
import { ExternalAuthModule } from '../auth/auth.module';
import { CallbackModule } from '../callback/callback.module';
import { WalletModule } from '../wallet/wallet.module';
import { AdminDepositController, DepositController } from './deposit.controller';
import { DepositRepository } from './deposit.repository';
import { DepositService } from './deposit.service';

@Module({
  imports: [TronModule, PrismaModule, WalletModule, CallbackModule],
  providers: [DepositService, DepositRepository],
  exports: [DepositService],
})
export class DepositModule {}

@Module({
  imports: [DepositModule, ExternalAuthModule],
  controllers: [DepositController],
})
export class DepositApiModule {}

@Module({
  imports: [DepositModule],
  controllers: [AdminDepositController],
})
export class DepositAdminModule {}
