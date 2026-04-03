import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BalanceService } from './balance.service';

@ApiTags('Balance')
@ApiSecurity('ApiKeyAuth') // 🔑 Swagger에서 x-api-key 입력 가능하도록 설정
@UseGuards(ApiKeyGuard) // 🔐 실제 인증: API Key 검증
@Controller('balance')
export class BalanceController {
  constructor(private readonly service: BalanceService) {}

  //   @Get()
  //   @ApiOperation({
  //     summary: '잔액 조회',
  //     description: `
  // 현재 잔액을 조회합니다.

  // ✔ 계산 방식:
  // - CONFIRMED deposit 합계
  // - (Phase1에서는 withdrawal 제외 또는 단순 반영)

  // ✔ 특징:
  // - 실시간 계산 기반 (ledger 단순 구조)
  // - token 단위 조회

  // ✔ 사용 목적:
  // - 사용자 잔액 확인
  // - 서비스 정산 기준 데이터
  //   `,
  //   })
  //   async getBalance() {
  //     return this.service.getBalance();
  //   }
}

@ApiTags('Balance')
@ApiBearerAuth() // 🔑 Swagger에서 Bearer 토큰 입력 가능
@UseGuards(JwtAuthGuard) // 🔐 실제 인증: JWT 검증
@Controller('portal/balance')
export class AdminBalanceController {
  constructor(private readonly service: BalanceService) {}

  @Get()
  async getBalance() {
    return this.service.getBalance();
  }

  @Get('admin')
  async getAdminBalance() {
    return this.service.getAdminBalance();
  }
}
