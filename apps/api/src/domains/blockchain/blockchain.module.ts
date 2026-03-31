import { TronModule } from '@/infra/tron/tron.module';
import { Module } from '@nestjs/common';
import { AdminBlockchainController } from './blockchain.controller';
import { AdminBlockchainService } from './blockchain.service';

@Module({
  imports: [TronModule],
  providers: [AdminBlockchainService],
  controllers: [AdminBlockchainController],
})
export class BlockChainModule {}
