import { EnvService } from '@/core/env/env.service';
import { waitForMiliSeconds } from '@/core/utils/common';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { TronClient } from './tron.client';
import { ITronContractEvent, ITronContractEventResponse, Trc20Contract } from './tron.types';

@Injectable()
export class TronService {
  private readonly logger = new Logger(TronService.name);
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

  async getTokenBalance(address: string): Promise<number> {
    this.validateAddress(address);

    const contract = (await this.client.getContract(this.env.tronUsdtContract)) as unknown as Trc20Contract;

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

  async transferToken(privateKey: string, to: string, amount: number): Promise<string> {
    const tokenContract = this.env.tronUsdtContract;

    this.validateAddress(to);
    this.validatePrivateKey(privateKey);

    const contract = (await this.client.getContract(tokenContract, privateKey)) as unknown as Trc20Contract;

    const decimals = await this.getTokenDecimals(tokenContract);

    const rawAmount = BigInt(Math.floor(amount * 10 ** 6)) * BigInt(10 ** (decimals - 6));

    const txHash = (await contract.transfer(to, rawAmount.toString()).send({
      feeLimit: 100_000_000,
    })) as string;

    if (!txHash) {
      throw new Error('Token transfer failed: empty txHash');
    }

    return txHash;
  }

  async transferTrx(privateKey: string, toAddress: string, amount: number): Promise<string> {
    this.validateAddress(toAddress);
    this.validatePrivateKey(privateKey);
    return this.client.sendTrx(privateKey, toAddress, amount);
  }

  async waitForConfirm(txId: string, options?: { timeoutMs?: number; intervalMs?: number }): Promise<void> {
    return this.client.waitForConfirm(txId, options);
  }
  async getContractEventsByBlock(params: { eventName: string; blockNumber: number }): Promise<ITronContractEvent[]> {
    const all: ITronContractEvent[] = [];

    let fingerprint: string | undefined;
    let retry = 0;

    const MAX_RETRY = 5;

    while (true) {
      try {
        const res = await axios.get<ITronContractEventResponse>(`${this.env.tronFullHost}/v1/contracts/${this.env.tronUsdtContract}/events`, {
          params: {
            event_name: params.eventName,
            block_number: params.blockNumber,
            only_confirmed: true,
            order_by: 'block_timestamp,asc',
            limit: 200,
            fingerprint,
          },
        });

        const data = res.data.data ?? [];
        all.push(...data);

        const next = res.data.meta?.fingerprint;

        if (!next) {
          return all;
        }

        fingerprint = next;

        // 🔥 pagination throttle + jitter
        await waitForMiliSeconds(200 + Math.random() * 200);

        // 성공 시 retry 초기화
        retry = 0;
      } catch (err: unknown) {
        let status: number | undefined;

        if (err instanceof AxiosError) {
          status = err.response?.status;
        }

        if (this.isRateLimit(err) && retry < MAX_RETRY) {
          const delay = Math.min(2000, 300 * Math.pow(2, retry)) + Math.random() * 200;

          this.logger.warn(`[tron] retry block=${params.blockNumber} retry=${retry} delay=${delay.toFixed(0)}ms status=${status}`);

          await waitForMiliSeconds(delay);

          retry++;
          continue; // 🔥 fingerprint 유지 상태로 재시도
        }

        this.logger.error(`[tron] failed block=${params.blockNumber} status=${status} message=${err instanceof Error ? err.message : String(err)}`);

        throw err;
      }
    }
  }

  isRateLimit(err: unknown): boolean {
    if (!(err instanceof AxiosError)) return false;

    const status = err.response?.status;

    // 🔥 rate limit + transient error 포함
    if (status === 429 || status === 500 || status === 502 || status === 503 || status === 504) {
      return true;
    }

    // 🔥 네트워크 에러 (응답 자체 없음)
    if (!status) {
      return true;
    }

    return false;
  }
}
