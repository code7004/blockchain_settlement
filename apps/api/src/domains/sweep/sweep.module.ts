import { TronModule } from '@/infra/tron/tron.module';
import { Module } from '@nestjs/common';
import { SweepService } from './sweep.service';

@Module({
  imports: [TronModule],
  providers: [SweepService],
  exports: [SweepService],
})
export class SweepModule {}
