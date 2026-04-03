import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { PartnerId } from '../auth/decorators/partner-id.decorator';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DepositService } from './deposit.service';
import { ApiGetDepositQueryDto, GetDepositsQueryDto } from './dto/get-deposits.query.dto';

@ApiTags('Deposits')
@ApiSecurity('ApiKeyAuth') // 🔑 Swagger에서 x-api-key 입력 가능하도록 설정
@UseGuards(ApiKeyGuard) // 🔐 실제 인증: API Key 검증
@Controller('deposits')
export class DepositController {
  constructor(private readonly service: DepositService) {}

  @Get()
  @ApiOperation({
    summary: 'Deposit 목록 조회',
    description: `
입금(Deposit) 내역을 조회합니다.

✔ 상태 흐름:
- DETECTED → CONFIRMED

✔ 특징:
- CONFIRMED 이후 잔액 반영
- txHash 기준으로 식별

✔ 사용 목적:
- 입금 확인
- 정산 상태 추적

✔ 권장 필터:
- status
- txHash
- userId
  `,
  })
  findAll(@Query() dto: ApiGetDepositQueryDto, @PartnerId() partnerId: string) {
    return this.service.findAll({ ...dto, partnerId });
  }
}

@ApiTags('Portal - Deposits')
@ApiBearerAuth() // 🔑 Swagger에서 Bearer 토큰 입력 가능
@UseGuards(JwtAuthGuard) // 🔐 실제 인증: JWT 검증
@Controller('portal/deposits')
export class AdminDepositController {
  constructor(private readonly service: DepositService) {}

  @Get()
  findAll(@Query() query: GetDepositsQueryDto) {
    return this.service.findAll(query);
  }
}
