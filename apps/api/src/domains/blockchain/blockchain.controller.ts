import { EnvService } from '@/core/env/env.service';
import { JwtAuthGuard } from '@/domains/auth/guards/jwt-auth.guard';
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminBlockchainService } from './blockchain.service';
import { TestTransferDto } from './dto/test-transfer.dto';
import { TestWalletBalanceDto } from './dto/test-wallet-balance.dto';

@ApiTags('Admin - Blockchain')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/blockchain')
export class AdminBlockchainController {
  constructor(
    private readonly service: AdminBlockchainService,
    private readonly env: EnvService,
  ) {}

  @Get('wallet-balance')
  async getWalletBalance(@Query() query: TestWalletBalanceDto) {
    return { data: { trx: await this.service.getTrxBalance(query.address), token: await this.service.getTokenBalance(this.env.tronUsdtContract, query.address) } };
  }

  @Post('test-transfer')
  async testTransfer(@Body() dto: TestTransferDto) {
    return { data: await this.service.testTransfer(dto) };
  }
}
