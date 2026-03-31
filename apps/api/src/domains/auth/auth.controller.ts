/**
 * AuthController
 * ------------------------------------------------------------------
 * 인증 API 엔드포인트
 *
 * 변경사항:
 * - LoginDto 적용 (class-validator + Swagger)
 */

import { Body, Controller, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './dto/auth-login.dto';
import { ChangePwdMemberDto, VerifyPwdMemberDto } from './dto/change-pwd-member.dto';

@ApiTags('Admin - Member') // Swagger 그룹 (Admin 영역 구분)
@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly service: AuthService) {}

  /**
   * Admin 로그인
   *
   * @param dto LoginDto
   * @returns accessToken
   */
  @Post('login')
  async login(@Body() dto: AuthLoginDto) {
    return this.service.login(dto.username, dto.password);
  }

  @Post('verify-pwd')
  async verifyPwd(@Body() dto: VerifyPwdMemberDto) {
    return this.service.verifyPwd(dto);
  }

  @Patch('change-pwd')
  async changePwd(@Body() dto: ChangePwdMemberDto) {
    return this.service.changePwd(dto);
  }
}
