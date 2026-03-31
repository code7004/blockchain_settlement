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
import { MemberAdminModule } from './domains/member/member.module';
import { MonitorModule } from './domains/monitor/monitor.module';
import { WalletAdminModule, WalletApiModule } from './domains/wallet/wallet.module';
import { WithdrawalAdminModule, WithdrawalApiModule } from './domains/withdrawal/withdrawal.module';
import { WorkerModule } from './worker/worker.module';

const CommonModules = [ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../../.env'] }), EnvModule, PrismaModule, LoggerModule, WorkerModule];
export const AdminModules = [
  HealthAadminModule,
  AuthAdminModule,
  MemberAdminModule,
  PartnerAdminModule,
  UserAdminModule,
  WalletAdminModule,
  DepositAdminModule,
  WithdrawalAdminModule,
  CallbackAdaminModule,
  CallbackTestModule,
  BalanceAdminModule,
  BlockChainModule,
  MonitorModule,
];
export const ApiModules = [HealthApiModule, PartnerApiModule, UserApiModule, WalletApiModule, DepositApiModule, WithdrawalApiModule, CallbackApiModule, BalanceApiModule];
@Module({
  imports: [...CommonModules, ...AdminModules, ...ApiModules],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
