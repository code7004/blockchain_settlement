/**
 * AuthService
 * ------------------------------------------------------------------
 * 인증 핵심 비즈니스 로직 처리
 *
 * 기능:
 * - Admin 로그인 검증
 * - JWT 발급
 *
 * 보안:
 * - bcrypt 비교
 * - 평문 비밀번호 저장 금지
 */

import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthRepository } from './auth.repository';
import { ChangePwdMemberDto, VerifyPwdMemberDto } from './dto/change-pwd-member.dto';

/**
 * AuthService (개선 버전)
 * ------------------------------------------------------------------
 * AdminUser 테이블 기반 로그인
 */

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly repo: AuthRepository,
  ) {}

  async login(username: string, password: string) {
    const member = await this.repo.findUnique(username);

    if (!member || !member.isActive) {
      throw new UnauthorizedException('Invalid username');
    }

    const isValid = await bcrypt.compare(password, member.password);

    if (!isValid) {
      throw new UnauthorizedException('Invalid password');
    }

    const accessToken = await this.jwtService.signAsync({ sub: member.id, username: member.username, role: member.role });
    const decoded = this.jwtService.decode<{ exp: number }>(accessToken);
    return {
      data: {
        accessToken,
        tokenType: 'Bearer',
        expiresAt: decoded.exp * 1000,
        id: member.id,
        username: member.username,
        role: member.role,
      },
    };
  }

  async verifyPwd(dto: VerifyPwdMemberDto) {
    const member = await this.repo.findById(dto.id);
    if (!member || !member.id) throw new NotFoundException('member not found');

    const isValid = await bcrypt.compare(dto.password, member.password);

    if (!isValid) throw new NotFoundException('invalid password');

    return isValid;
  }

  async changePwd(dto: ChangePwdMemberDto) {
    void this.verifyPwd({ id: dto.id, password: dto.oldPassword });

    const hashed = await bcrypt.hash(dto.newPassword, 10);
    return await this.repo.updatePwd(dto.id, { password: hashed });
  }
}
