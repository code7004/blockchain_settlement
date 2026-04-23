import { TronWeb } from 'tronweb';

export interface TronClientOptions {
  fullHost?: string;
  apiKey?: string;
}

const DEFAULT_FULL_HOST = 'https://api.trongrid.io';
const DEFAULT_OWNER = 'T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb';

export class TronClient {
  private readonly tronWeb: TronWeb;
  private readonly fullHost: string;
  private readonly apiKey?: string;

  constructor(options: TronClientOptions) {
    const { fullHost = DEFAULT_FULL_HOST, apiKey } = options;

    this.fullHost = fullHost;
    this.apiKey = apiKey;

    this.tronWeb = this.createReadonlyClient();

    // read-only 호출용 기본 address 설정
    this.tronWeb.setAddress(DEFAULT_OWNER);
  }

  // -------------------------------
  // CLIENT FACTORY
  // -------------------------------

  private buildHeaders() {
    return this.apiKey ? { 'TRON-PRO-API-KEY': this.apiKey } : undefined;
  }

  private createReadonlyClient(): TronWeb {
    return new TronWeb({
      fullHost: this.fullHost,
      headers: this.buildHeaders(),
    });
  }

  private createSignerClient(privateKey: string): TronWeb {
    if (!this.isPrivateKey(privateKey)) {
      throw new Error('Invalid privateKey format');
    }

    return new TronWeb({
      fullHost: this.fullHost,
      privateKey,
      headers: this.buildHeaders(),
    });
  }

  // -------------------------------
  // ACCOUNT
  // -------------------------------

  async createAccount() {
    const acct = await this.tronWeb.createAccount();

    return {
      address: acct.address.base58,
      privateKey: acct.privateKey,
    };
  }

  // -------------------------------
  // BLOCK / TX
  // -------------------------------

  async getCurrentBlock() {
    return this.tronWeb.trx.getCurrentBlock();
  }

  async getBlockByNumber(blockNumber: number) {
    return this.tronWeb.trx.getBlock(blockNumber);
  }

  async getTransactionInfo(txId: string) {
    return this.tronWeb.trx.getTransactionInfo(txId);
  }

  // -------------------------------
  // ADDRESS
  // -------------------------------
  hexToBase58(hex: string): string {
    return this.tronWeb.address.fromHex(hex);
  }

  isAddress(address: string) {
    return this.tronWeb.isAddress(address);
  }

  isPrivateKey(privateKey: string) {
    return /^[0-9a-fA-F]{64}$/.test(privateKey);
  }

  // -------------------------------
  // BALANCE
  // -------------------------------

  async getBalance(address: string) {
    return this.tronWeb.trx.getBalance(address);
  }

  // -------------------------------
  // CONTRACT
  // -------------------------------

  async getContract(contractAddress: string, privateKey?: string) {
    const tron = privateKey ? this.createSignerClient(privateKey) : this.tronWeb;

    return tron.contract().at(contractAddress);
  }

  // -------------------------------
  // TRANSFER
  // -------------------------------

  async sendTrx(privateKey: string, toAddress: string, amount: number): Promise<string> {
    const tron = this.createSignerClient(privateKey);

    const fromAddress = tron.defaultAddress.base58;

    if (!fromAddress) {
      throw new Error('Invalid signer address');
    }

    const sunAmount = Math.floor(amount * 1_000_000);

    const tx = await tron.transactionBuilder.sendTrx(toAddress, sunAmount, fromAddress);

    const signed = await tron.trx.sign(tx, privateKey);
    const result = await tron.trx.sendRawTransaction(signed);

    if (!result.result) {
      throw new Error('TRX transfer failed');
    }

    return result.txid;
  }

  // tron.service.ts

  async waitForConfirm(txId: string, options?: { timeoutMs?: number; intervalMs?: number }): Promise<void> {
    const timeoutMs = options?.timeoutMs ?? 60_000; // 최대 60초
    const intervalMs = options?.intervalMs ?? 2_000; // 2초 polling

    const start = Date.now();

    while (true) {
      try {
        const tx = await this.tronWeb.trx.getTransactionInfo(txId);

        // 아직 block에 포함 안됨
        if (!tx || !tx.id) {
          // noop
        } else {
          // 성공 여부 체크
          if (tx.receipt) {
            const result = tx.receipt.result;

            if (result === 'SUCCESS') {
              return;
            }

            if (result === 'FAILED' || result === 'OUT_OF_ENERGY') {
              throw new Error(`TX failed: ${result}`);
            }
          }
        }
      } catch (err: unknown) {
        void err;
      }

      // timeout 체크
      if (Date.now() - start > timeoutMs) {
        throw new Error(`waitForConfirm timeout txId=${txId}`);
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }
}
