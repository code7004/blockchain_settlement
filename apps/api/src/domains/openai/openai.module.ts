import { PrismaModule } from '@/infra/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { OpenAiController } from './openai.controller';
import { OpenAiService } from './openai.service';

@Module({
  imports: [PrismaModule],
  providers: [OpenAiService],
  controllers: [OpenAiController],
})
export class OpenAiModule {}
