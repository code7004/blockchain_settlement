import { PrismaModule } from '@/infra/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { CallbackTestController } from './callback-test.controller';
import { CallbackTestService } from './callback-test.service';

@Module({
  imports: [PrismaModule],
  controllers: [CallbackTestController],
  providers: [CallbackTestService],
})
export class CallbackTestModule {}
