// auth/strategies/jwt.strategy.ts
import { EnvService } from '@/core/env/env.service';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { MemberRole } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';

interface IJwtPayload {
  sub: string;
  username?: string;
  role?: MemberRole;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(env: EnvService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: env.jwtSecret,
    });
  }

  validate(payload: IJwtPayload) {
    return {
      adminId: payload.sub,
      username: payload.username,
      role: payload.role,
    };
  }
}
