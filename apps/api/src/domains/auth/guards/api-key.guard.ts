/**
 * admin/auth/guards/api-key.quard.ts
 * ApiKeyGuard
 * ------------------------------------------------------------------
 * Partner API 인증 Guard
 *
 * 방식:
 * - header: x-api-key
 *
 * 동작:
 * - 모든 active partner 조회
 * - bcrypt 비교
 * - 일치 시 request.partnerId 주입
 *
 * 보안:
 * - raw key 저장 금지
 * - hash 비교 방식 사용
 */
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { Request } from 'express';
import { AuthRepository } from '../auth.repository';

export interface IRequestWithPartner extends Request {
  partnerId?: string;
}

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly authRepo: AuthRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<IRequestWithPartner>();

    const apiKey = request.headers['x-api-key'];

    if (!apiKey || typeof apiKey !== 'string') {
      throw new UnauthorizedException('API key missing');
    }

    const [prefix] = apiKey.split('.');

    if (!prefix || prefix.length < 6) {
      throw new UnauthorizedException('Invalid API key format');
    }

    const partner = await this.authRepo.findPartnerByPrefix(prefix);

    if (!partner) {
      throw new UnauthorizedException('Invalid API key');
    }

    // 핵심: 전체 apiKey 비교
    const isMatch = await bcrypt.compare(apiKey, partner.apiKeyHash);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid API key');
    }

    request.partnerId = partner.id;

    return true;
  }
}
