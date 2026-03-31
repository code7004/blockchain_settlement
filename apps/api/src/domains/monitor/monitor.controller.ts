import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MonitorService } from './monitor.service';

@ApiTags('Admin - Blockchain')
@ApiBearerAuth() // 🔑 Swagger에서 Bearer 토큰 입력 가능
@UseGuards(JwtAuthGuard) // 🔐 실제 인증: JWT 검증
@Controller('admin/blockchain/monitor')
export class MonitorController {
  constructor(private readonly service: MonitorService) {}

  @Get(':txHash')
  async getFlow(@Param('txHash') txHash: string) {
    return this.service.getProcessFlow(txHash);
  }
}
