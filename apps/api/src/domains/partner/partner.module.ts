// partenr.module.ts
import { Module } from '@nestjs/common';
import { ExternalAuthModule } from '../auth/auth.module';
import { AdminPartnerController, PartnerController } from './partner.controller';
import { PartnerRepository } from './partner.repository';
import { PartnerService } from './partner.service';

// core module
@Module({
  providers: [PartnerService, PartnerRepository],
  exports: [PartnerService],
})
export class PartnerModule {}

// API module
@Module({
  imports: [PartnerModule, ExternalAuthModule],
  controllers: [PartnerController],
})
export class PartnerApiModule {}

// Admin module
@Module({
  imports: [PartnerModule],
  controllers: [AdminPartnerController],
})
export class PartnerAdminModule {}
