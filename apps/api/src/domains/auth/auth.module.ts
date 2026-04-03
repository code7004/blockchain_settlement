/**
 * AuthModule
 * ------------------------------------------------------------------
 * 인증 관련 모듈 (JWT + API Key)
 *
 * 구성:
 * - AuthService
 * - AuthController
 * - JWT Strategy
 * - Guards (JWT / API Key)
 *
 * 역할:
 * - Admin 인증 (JWT)
 * - Partner 인증 (API Key)
 */

import { PrismaModule } from '@/infra/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AdminAuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { ApiKeyGuard } from './guards/api-key.guard';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [PrismaModule], // 🔥 추가 추천
  providers: [AuthRepository, ApiKeyGuard],
  exports: [ApiKeyGuard, AuthRepository],
})
export class ExternalAuthModule {}

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET');
        const isDev = config.get<string>('NODE_ENV') === 'development';

        if (!secret) {
          throw new Error('JWT_SECRET is not defined');
        }

        return {
          secret,
          signOptions: { expiresIn: isDev ? '4h' : '2h' },
        };
      },
    }),
  ],
  providers: [AuthService, AuthRepository, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}

@Module({
  imports: [AuthModule],
  controllers: [AdminAuthController],
})
export class AuthAdminModule {}
