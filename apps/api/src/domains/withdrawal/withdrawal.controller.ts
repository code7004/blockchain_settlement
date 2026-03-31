import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { GetWithdrawalsQueryDto } from './dto/get-withdrawals.query.dto';
import { WithdrawalService } from './withdrawal.service';

@ApiTags('Withdrawals')
@ApiSecurity('ApiKeyAuth') // 🔑 Swagger에서 x-api-key 입력 가능하도록 설정
@UseGuards(ApiKeyGuard) // 🔐 실제 인증: API Key 검증
@Controller('withdrawals')
export class WithdrawalController {}

@ApiTags('Admin - Withdrawals')
@ApiBearerAuth() // 🔑 Swagger에서 Bearer 토큰 입력 가능
@UseGuards(JwtAuthGuard) // 🔐 실제 인증: JWT 검증
@Controller('withdrawals')
export class AdminWithdrawalController {
  constructor(private readonly withdrawalService: WithdrawalService) {}

  @Post()
  create(@Body() dto: CreateWithdrawalDto) {
    return this.withdrawalService.create(dto);
  }

  @Get()
  async findAll(@Query() query: GetWithdrawalsQueryDto) {
    return this.withdrawalService.findAll(query);
  }
}
