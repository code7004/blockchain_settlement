import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { PartnerId } from '../auth/decorators/partner-id.decorator';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { ApiGetWalletsQueryDto, GetWalletsQueryDto } from './dto/get-wallets.query.dto';
import { WalletService } from './wallet.service';

// --- API Controller ---
@ApiTags('Wallets')
@ApiSecurity('ApiKeyAuth') // 🔑 Swagger에서 x-api-key 입력 가능하도록 설정
@UseGuards(ApiKeyGuard) // 🔐 실제 인증: API Key 검증
@Controller('wallets')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @ApiOperation({
    summary: 'Wallet 목록 조회',
    description: `
Partner에 속한 Wallet 목록을 조회합니다.

✔ 포함 정보:
- wallet address
- userId
- 상태 정보

✔ 사용 목적:
- 입금 주소 확인
- 사용자별 wallet 매핑 조회
  `,
  })
  findAll(@Query() dto: ApiGetWalletsQueryDto, @PartnerId() partnerId: string) {
    return this.walletService.findAll({ ...dto, partnerId });
  }
}

// --- Admin Controller ---
@ApiTags('Portal - Wallet')
@ApiBearerAuth() // 🔑 Swagger에서 Bearer 토큰 입력 가능
@UseGuards(JwtAuthGuard) // 🔐 실제 인증: JWT 검증
@Controller('portal/wallets')
export class ADminWalletController {
  constructor(private readonly service: WalletService) {}

  @Post()
  create(@Body() dto: CreateWalletDto) {
    return this.service.createWallet(dto.userId);
  }

  @Get()
  findAll(@Query() query: GetWalletsQueryDto) {
    return this.service.findAll(query);
  }
}
