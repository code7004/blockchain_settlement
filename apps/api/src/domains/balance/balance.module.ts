import { Module } from '@nestjs/common';
import { ExternalAuthModule } from '../auth/auth.module';
import { AdminBalanceController, BalanceController } from './balance.controller';
import { BalanceRepository } from './balance.repository';
import { BalanceService } from './balance.service';

@Module({
  providers: [BalanceService, BalanceRepository],
  exports: [BalanceService],
})
export class BalanceModule {}

@Module({
  imports: [BalanceModule, ExternalAuthModule],
  controllers: [BalanceController],
})
export class BalanceApiModule {}

@Module({
  imports: [BalanceModule],
  controllers: [AdminBalanceController],
})
export class BalanceAdminModule {}
