import { PrismaModule } from '@/infra/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { ExternalAuthModule } from '../auth/auth.module';
import { AdminCallbacktController, CallbacktController } from './callback.controller';
import { CallbackRepository } from './callback.repository';
import { CallbackService } from './callback.service';

@Module({
  imports: [PrismaModule],
  providers: [CallbackService, CallbackRepository],
  exports: [CallbackService],
})
export class CallbackModule {}

@Module({
  imports: [CallbackModule, ExternalAuthModule],
  controllers: [CallbacktController],
})
export class CallbackApiModule {}

@Module({
  imports: [CallbackModule],
  controllers: [AdminCallbacktController],
})
export class CallbackAdaminModule {}
