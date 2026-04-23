import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetSweepQueryDto } from './dto/get-sweep.query.dto';
import { SweepService } from './sweep.service';

@ApiTags('Sweeps')
@ApiBearerAuth() // 🔑 Swagger에서 Bearer 토큰 입력 가능
@UseGuards(JwtAuthGuard) // 🔐 실제 인증: JWT 검증
@Controller('portal/sweeps')
export class PortalSweepController {
  constructor(private readonly service: SweepService) {}

  @Get()
  findAll(@Query() query: GetSweepQueryDto) {
    return this.service.findAll(query);
  }
}
