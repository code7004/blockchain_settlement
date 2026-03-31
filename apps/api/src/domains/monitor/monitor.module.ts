import { Module } from '@nestjs/common';
import { CallbackModule } from '../callback/callback.module';
import { DepositModule } from '../deposit/deposit.module';
import { MonitorController } from './monitor.controller';
import { MonitorService } from './monitor.service';

@Module({
  imports: [DepositModule, CallbackModule],
  providers: [MonitorService],
  controllers: [MonitorController],
})
export class MonitorModule {}
