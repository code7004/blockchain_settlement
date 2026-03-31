import { Module } from '@nestjs/common';
import { ExternalAuthModule } from '../auth/auth.module';
import { AdminWithdrawalController, WithdrawalController } from './withdrawal.controller';
import { WithdrawalRepository } from './withdrawal.repository';
import { WithdrawalService } from './withdrawal.service';

@Module({
  providers: [WithdrawalService, WithdrawalRepository],
  exports: [WithdrawalService],
})
export class WithdrawalModule {}

@Module({
  imports: [WithdrawalModule, ExternalAuthModule],
  controllers: [WithdrawalController],
})
export class WithdrawalApiModule {}

@Module({
  imports: [WithdrawalModule],
  controllers: [AdminWithdrawalController],
})
export class WithdrawalAdminModule {}
