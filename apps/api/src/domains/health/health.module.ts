import { Module } from '@nestjs/common';
import { ExternalAuthModule } from '../auth/auth.module';
import { AdminHealthController, HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
  providers: [HealthService],
})
export class HealthModule {}

@Module({
  imports: [HealthModule, ExternalAuthModule],
  controllers: [HealthController],
})
export class HealthApiModule {}

@Module({
  imports: [HealthModule],
  controllers: [AdminHealthController],
})
export class HealthAadminModule {}
