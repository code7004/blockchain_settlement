import { PrismaModule } from '@/infra/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { ExternalAuthModule } from '../auth/auth.module';
import { WalletModule } from '../wallet/wallet.module';
import { AdminUserController, UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

@Module({
  imports: [WalletModule, PrismaModule],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}

@Module({
  imports: [UserModule, ExternalAuthModule],
  controllers: [UserController],
})
export class UserApiModule {}

@Module({
  imports: [UserModule],
  controllers: [AdminUserController],
})
export class UserAdminModule {}
