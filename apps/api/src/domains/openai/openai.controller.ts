import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OpenAiService } from './openai.service';

// --- Admin Controller ---
@ApiTags('Portal - Openai')
@ApiBearerAuth() // 🔑 Swagger에서 Bearer 토큰 입력 가능
@UseGuards(JwtAuthGuard) // 🔐 실제 인증: JWT 검증
@Controller('portal/openai/chat')
export class OpenAiController {
  constructor(private readonly service: OpenAiService) {}

  @Post()
  create(@Body() dto: { messages: { role: string; content: string }[] }) {
    return this.service.chat(dto.messages);
  }
}
