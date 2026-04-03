// partner.controller.ts
import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { GetPartnersQueryDto } from './dto/get-partners.query.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { PartnerService } from './partner.service';

/**
 * Partner API (외부 파트너용)
 * - 인증 방식: API Key (x-api-key 헤더)
 * - Swagger: ApiKeyAuth 입력 필드 생성됨
 * - 용도: 파트너 서비스가 호출하는 API
 */
@ApiTags('Partner') // Swagger 그룹 (Partner API)
@ApiSecurity('ApiKeyAuth') // 🔑 Swagger에서 x-api-key 입력 가능하도록 설정
@UseGuards(ApiKeyGuard) // 🔐 실제 인증: API Key 검증
@Controller('partners')
export class PartnerController {}

/**
 * Admin API (운영자용)
 *
 * - 인증 방식: JWT (Bearer Token)
 * - Swagger: Authorization 버튼 활성화
 * - 용도: 관리자(Admin UI, 내부 운영툴)
 */
@ApiTags('Portal - Partner') // Swagger 그룹 (Admin 영역 구분)
@ApiBearerAuth() // 🔑 Swagger에서 Bearer 토큰 입력 가능
@UseGuards(JwtAuthGuard) // 🔐 실제 인증: JWT 검증
@Controller('portal/partners')
export class AdminPartnerController {
  constructor(private readonly service: PartnerService) {}

  @Post()
  async create(@Body() dto: CreatePartnerDto) {
    return this.service.create(dto);
  }

  @Get()
  async findAll(@Query() query: GetPartnersQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePartnerDto) {
    return this.service.update(id, dto);
  }

  /**
   * API Key 생성
   */
  @Post(':id/api-key/create')
  async generate(@Param('id') id: string) {
    return this.service.createApiKey(id);
  }

  /**
   * API Key 회전
   */
  @Post(':id/api-key/rotate')
  async rotate(@Param('id') id: string) {
    return this.service.rotate(id);
  }
}
