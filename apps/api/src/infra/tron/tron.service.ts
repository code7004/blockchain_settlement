import { EnvService } from '@/core/env/env.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { TronClient } from './tron.client';

type Trc20Contract = {
  balanceOf(address: string): { call(): Promise<unknown> };
  decimals(): { call(): Promise<unknown> };
  transfer(
    to: string,
    amount: string | number,
  ): {
    send(options: { feeLimit: number }): Promise<unknown>;
  };
};

@Injectable()
export class TronService {
  private readonly client: TronClient;

  constructor(private readonly env: EnvService) {
    this.client = new TronClient({
      fullHost: this.env.tronFullHost,
      apiKey: this.env.tronGridApiKey,
    });
  }

  // -------------------------------
  // ACCOUNT
  // -------------------------------

  createAccount() {
    return this.client.createAccount();
  }

  // -------------------------------
  // BLOCK
  // -------------------------------

  async getLatestBlockNumber(): Promise<number> {
    const block = await this.client.getCurrentBlock();

    const number = block?.block_header?.raw_data?.number;

    if (typeof number !== 'number') {
      throw new Error('Invalid block response');
    }

    return number;
  }

  async getBlockTransactions(blockNumber: number) {
    const block = await this.client.getBlockByNumber(blockNumber);
    return block.transactions ?? [];
  }

  // -------------------------------
  // TRANSACTION
  // -------------------------------

  async getTransactionInfo(txId: string) {
    return this.client.getTransactionInfo(txId);
  }

  // -------------------------------
  // ADDRESS
  // -------------------------------

  hexToBase58(hex: string): string {
    return this.client.hexToBase58(hex);
  }

  private validateAddress(address: string) {
    if (!this.client.isAddress(address)) {
      throw new BadRequestException('Invalid Tron address');
    }
  }

  private validatePrivateKey(privateKey: string) {
    if (!this.client.isPrivateKey(privateKey)) {
      throw new BadRequestException('Invalid private key');
    }
  }

  // -------------------------------
  // BALANCE
  // -------------------------------

  async getTrxBalance(address: string): Promise<number> {
    this.validateAddress(address);

    const sun = await this.client.getBalance(address);
    return sun / 1_000_000;
  }

  async getTokenBalance(tokenContract: string, address: string): Promise<number> {
    this.validateAddress(address);

    const contract = (await this.client.getContract(tokenContract)) as unknown as Trc20Contract;

    const [balanceRaw, decimalsRaw] = (await Promise.all([contract.balanceOf(address).call(), contract.decimals().call()])) as number[];

    const balance = Number(balanceRaw.toString());
    const decimals = Number(decimalsRaw.toString());

    return balance / 10 ** decimals;
  }

  // -------------------------------
  // TRANSFER
  // -------------------------------

  private decimalsCache = new Map<string, number>();

  private async getTokenDecimals(contractAddress: string): Promise<number> {
    if (this.decimalsCache.has(contractAddress)) {
      return this.decimalsCache.get(contractAddress)!;
    }

    const contract = (await this.client.getContract(contractAddress)) as unknown as Trc20Contract;

    const raw = (await contract.decimals().call()) as number;
    const decimals = Number(raw.toString());

    this.decimalsCache.set(contractAddress, decimals);

    return decimals;
  }

  async transferToken(privateKey: string, tokenContract: string, to: string, amount: number): Promise<string> {
    this.validateAddress(to);
    this.validatePrivateKey(privateKey);

    const contract = (await this.client.getContract(tokenContract, privateKey)) as unknown as Trc20Contract;

    // decimals 캐싱 사용
    const decimals = await this.getTokenDecimals(tokenContract);

    // 정밀도 안전 처리 (string 기반)
    const rawAmount =
      BigInt(Math.floor(amount * 10 ** 6)) * // base precision
      BigInt(10 ** (decimals - 6));

    const txHash = (await contract.transfer(to, rawAmount.toString()).send({
      feeLimit: 100_000_000,
    })) as string;

    if (!txHash) {
      throw new Error('Token transfer failed: empty txHash');
    }

    return txHash;
  }

  async sendTrx(privateKey: string, toAddress: string, amount: number): Promise<string> {
    this.validateAddress(toAddress);
    this.validatePrivateKey(privateKey);

    return this.client.sendTrx(privateKey, toAddress, amount);
  }
}
