import { Module } from '@nestjs/common';
import { TronModule } from '../../infra/tron/tron.module';
import { ExternalAuthModule } from '../auth/auth.module';
import { ADminWalletController, WalletController } from './wallet.controller';
import { WalletRepository } from './wallet.repository';
import { WalletService } from './wallet.service';

@Module({
  imports: [TronModule],
  providers: [WalletService, WalletRepository],
  exports: [WalletRepository, WalletService],
})
export class WalletModule {}

@Module({
  imports: [WalletModule, ExternalAuthModule],
  controllers: [WalletController],
})
export class WalletApiModule {}

@Module({
  imports: [WalletModule],
  controllers: [ADminWalletController],
})
export class WalletAdminModule {}
