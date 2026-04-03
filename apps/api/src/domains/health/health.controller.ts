import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../infra/prisma/prisma.service';

@ApiTags('health')
// @ApiSecurity('ApiKeyAuth') // 🔑 Swagger에서 x-api-key 입력 가능하도록 설정
// @UseGuards(ApiKeyGuard) // 🔐 실제 인증: API Key 검증
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({
    summary: 'Health Check',
    description: '외부 서비스(Partner)가 API 서버 상태를 확인하기 위한 endpoint',
  })
  @ApiResponse({
    status: 200,
    description: '정상 응답',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2026-03-26T12:00:00.000Z',
      },
    },
  })
  ping() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}

@ApiTags('Portal - Health')
// @ApiBearerAuth() // 🔑 Swagger에서 Bearer 토큰 입력 가능
// @UseGuards(JwtAuthGuard) // 🔐 실제 인증: JWT 검증
@Controller('portal/health')
export class AdminHealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  ping() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  // @Get('db')
  // async db() {
  //   // DB roundtrip 최소 확인
  //   const row = await this.prisma.healthPing.create({
  //     data: { message: 'db-ok' },
  //     select: { id: true, createdAt: true },
  //   });
  //   return { ok: true, db: 'connected', sample: row };
  // }
}
