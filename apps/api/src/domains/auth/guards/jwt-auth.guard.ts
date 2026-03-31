/**
 * auth/guards/jwt-auth.guard.ts
 * JwtAuthGuard
 * ------------------------------------------------------------------
 * Admin API 보호용 Guard
 *
 * 역할:
 * - JWT 인증 필수 강제
 * - 인증 실패 시 401 반환
 */

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
