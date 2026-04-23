import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { LoggerModule } from '@/core/logger/logger.module';
import { HealthAadminModule, HealthApiModule } from '@/domains/health/health.module';
import { PartnerAdminModule, PartnerApiModule } from '@/domains/partner/partner.module';
import { UserAdminModule, UserApiModule } from '@/domains/user/user.module';
import { PrismaModule } from '@/infra/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EnvModule } from './core/env/env.module';
import { AuthAdminModule } from './domains/auth/auth.module';
import { BalanceAdminModule, BalanceApiModule } from './domains/balance/balance.module';
import { BlockChainModule } from './domains/blockchain/blockchain.module';
import { CallbackTestModule } from './domains/callback-test/callback-test.module';
import { CallbackAdaminModule, CallbackApiModule } from './domains/callback/callback.module';
import { DepositAdminModule, DepositApiModule } from './domains/deposit/deposit.module';
import { ExceptionLogModule } from './domains/exception-log/exception-log.module';
import { MemberAdminModule } from './domains/member/member.module';
import { MonitorModule } from './domains/monitor/monitor.module';
import { OpenAiModule } from './domains/openai/openai.module';
import { SweepModule } from './domains/sweep/sweep.module';
import { WalletAdminModule, WalletApiModule } from './domains/wallet/wallet.module';
import { WithdrawalAdminModule, WithdrawalApiModule } from './domains/withdrawal/withdrawal.module';
import { WorkerModule } from './worker/worker.module';

const CommonModules = [ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../../.env'] }), EnvModule, PrismaModule, LoggerModule, WorkerModule];
export const PortalModules = [
  HealthAadminModule,
  AuthAdminModule,
  MemberAdminModule,
  PartnerAdminModule,
  UserAdminModule,
  WalletAdminModule,
  DepositAdminModule,
  WithdrawalAdminModule,
  CallbackAdaminModule,
  SweepModule,
  CallbackTestModule,
  BalanceAdminModule,
  ExceptionLogModule,
  BlockChainModule,
  MonitorModule,
  OpenAiModule,
];
export const ApiModules = [HealthApiModule, PartnerApiModule, UserApiModule, WalletApiModule, DepositApiModule, WithdrawalApiModule, CallbackApiModule, BalanceApiModule];
@Module({
  imports: [...CommonModules, ...PortalModules, ...ApiModules],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
