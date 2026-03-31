import { JwtAuthGuard } from '@/domains/auth/guards/jwt-auth.guard';
import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateMemberDto } from './dto/create-member.dto';
import { DeleteMembersDto } from './dto/delete-member.dto';
import { GetMemberDto } from './dto/get-member.dto';
import { MemberService } from './member.service';

@ApiTags('Admin - Member')
@ApiBearerAuth() // 🔑 Swagger에서 Bearer 토큰 입력 가능
@UseGuards(JwtAuthGuard) // 🔐 실제 인증: JWT 검증
@Controller('/admin/members')
export class AdminMemberController {
  constructor(private readonly service: MemberService) {}

  @Post()
  async create(@Body() dto: CreateMemberDto) {
    return this.service.create(dto);
  }

  @Get()
  async findAll(@Query() query: GetMemberDto) {
    return await this.service.findAll(query);
  }

  /**
   * Member 삭제 (Soft Delete)
   *
   * @param id user id
   */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.service.deleteUser(id);
  }

  /**
   * Member 다중 삭제 (Soft Delete)
   */
  @Delete()
  async removeMany(@Body() dto: DeleteMembersDto) {
    return this.service.deleteUsers(dto.ids);
  }
}
