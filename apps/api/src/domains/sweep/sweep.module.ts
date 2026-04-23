import { Module } from '@nestjs/common';
import { PortalSweepController } from './sweep.controller';
import { SweepRepository } from './sweep.repository';
import { SweepService } from './sweep.service';

@Module({
  controllers: [PortalSweepController],
  providers: [SweepService, SweepRepository],
  exports: [SweepService],
})
export class SweepModule {}
