import { JwtAuthGuard } from '@/domains/auth/guards/jwt-auth.guard';
import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateMemberDto } from './dto/create-member.dto';
import { GetMemberQueryDto } from './dto/get-member-query.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { MemberService } from './member.service';

@ApiTags('Portal - Member')
@ApiBearerAuth() // 🔑 Swagger에서 Bearer 토큰 입력 가능
@UseGuards(JwtAuthGuard) // 🔐 실제 인증: JWT 검증
@Controller('portal/members')
export class AdminMemberController {
  constructor(private readonly service: MemberService) {}

  @Post()
  async create(@Body() dto: CreateMemberDto) {
    return this.service.create(dto);
  }

  @Get()
  async findAll(@Query() query: GetMemberQueryDto) {
    return await this.service.findAll(query);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateMemberDto) {
    return this.service.update(id, dto);
  }
}
