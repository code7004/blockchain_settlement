import { ApiPartnerIdDto } from '@/core/dto/api-partner.dto';
import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CallbackService } from './callback.service';
import { GetCallbackQueryDto } from './dto/get-callback.query.dto';
import { RetryFailedIdsBodyDto } from './dto/retry.dto';
import { UpdateCallbackDto } from './dto/update.callback.dto';

@ApiTags('Callbacks')
@ApiSecurity('ApiKeyAuth') // 🔑 Swagger에서 x-api-key 입력 가능하도록 설정
@UseGuards(ApiKeyGuard) // 🔐 실제 인증: API Key 검증
@Controller('callbacks')
export class CallbacktController {}

@ApiTags('Callbacks')
@ApiBearerAuth() // 🔑 Swagger에서 Bearer 토큰 입력 가능
@UseGuards(JwtAuthGuard) // 🔐 실제 인증: JWT 검증
@Controller('portal/callbacks')
export class AdminCallbacktController {
  constructor(private readonly service: CallbackService) {}

  @Get()
  findAll(@Query() query: GetCallbackQueryDto) {
    return this.service.findAll(query);
  }

  @Post('retry/ids')
  retryFailedIds(@Body() body: RetryFailedIdsBodyDto) {
    return this.service.retryFailedIds(body);
  }

  @Post('retry-failed')
  retryFailedAll(@Body() body: ApiPartnerIdDto) {
    return this.service.retryFailedAll(body);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCallbackDto) {
    return this.service.update(id, dto);
  }
}
