import { EnvService } from '@/core/env/env.service';
import { TronService } from '@/infra/tron/tron.service';
import { Injectable } from '@nestjs/common';
import { TestTransferDto } from './dto/test-transfer.dto';

@Injectable()
export class AdminBlockchainService {
  constructor(
    private readonly env: EnvService,
    private readonly tronService: TronService,
  ) {}

  async testTransfer(dto: TestTransferDto) {
    const { fromPrivateKey, toAddress, amount } = dto;

    const contract = this.env.tronUsdtContract;

    const txHash = await this.tronService.transferToken(fromPrivateKey, contract, toAddress, amount);

    return { txHash };
  }

  async getTrxBalance(address: string) {
    return await this.tronService.getTrxBalance(address);
  }

  async getTokenBalance(tokenContract: string, address: string) {
    return await this.tronService.getTokenBalance(tokenContract, address);
  }
}
