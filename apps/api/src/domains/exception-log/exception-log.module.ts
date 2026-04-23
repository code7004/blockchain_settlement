import { Module } from '@nestjs/common';
import { AdminExceptionLogController } from './exception-log.controller';
import { ExceptionLogRepository } from './exception-log.repository';
import { ExceptionLogService } from './exception-log.service';

@Module({
  controllers: [AdminExceptionLogController],
  providers: [ExceptionLogService, ExceptionLogRepository],
  exports: [ExceptionLogService],
})
export class ExceptionLogModule {}
