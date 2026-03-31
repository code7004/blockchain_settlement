import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EnvService {
  constructor(private readonly config: ConfigService) {}

  // -------------------------------
  // INTERNAL
  // -------------------------------

  private mustGet(key: string): string {
    const value = this.config.get<string>(key);

    if (!value) {
      throw new Error(`Missing env: ${key}`);
    }

    return value;
  }

  // -------------------------------
  // TRON
  // -------------------------------

  get tronFullHost(): string {
    return this.mustGet('TRON_FULL_HOST');
  }

  get tronGridApiKey(): string | undefined {
    return this.config.get<string>('TRONGRID_API_KEY');
  }

  // -------------------------------
  // TOKEN
  // -------------------------------

  get tokenSymbol(): string {
    return this.mustGet('TOKEN_SYMBOL');
  }

  get tronUsdtContract(): string {
    return this.mustGet('TRON_USDT_CONTRACT');
  }

  // -------------------------------
  // WALLET
  // -------------------------------

  get hotWalletAddress(): string {
    return this.mustGet('HOT_WALLET_ADDRESS');
  }

  get hotWalletPrivateKey(): string {
    return this.mustGet('HOT_WALLET_PRIVATE_KEY');
  }

  get gasTankPrivateKey(): string {
    return this.mustGet('GAS_TANK_PRIVATE_KEY');
  }

  get gasTankAddress(): string {
    return this.mustGet('GAS_TANK_ADDRESS');
  }

  get walletMasterKey(): string {
    return this.mustGet('WALLET_MASTER_KEY_BASE64');
  }

  // -------------------------------
  // AUTH
  // -------------------------------

  get jwtSecret(): string {
    return this.mustGet('JWT_SECRET');
  }

  // -------------------------------
  // DB
  // -------------------------------

  get databaseUrl(): string {
    return this.mustGet('DATABASE_URL');
  }

  // -------------------------------
  // FEATURE FLAG
  // -------------------------------

  get useWatcherPollingCursor(): boolean {
    return this.config.get<string>('USE_WATCHER_POLLING_CURSOR') === 'true';
  }

  // -------------------------------
  // POLLING INTERVAL
  // -------------------------------

  getPollInterval(key: 'deposit' | 'confirm' | 'callback' | 'gasrefill' | 'sweep'): number {
    const envKeyMap = {
      deposit: 'DEPOSIT_POLL_INTERVAL',
      confirm: 'CONFIRM_POLL_INTERVAL',
      callback: 'CALLBACK_POLL_INTERVAL',
      gasrefill: 'GASREFILL_POLL_INTERVAL',
      sweep: 'SWEEP_POLL_INTERVAL',
    } as const;

    const envKey = envKeyMap[key];

    const raw = this.config.get<string>(envKey);

    if (raw == null) {
      throw new Error(`Missing env: ${envKey}`);
    }

    const value = Number(raw);

    if (!Number.isFinite(value) || value <= 0) {
      throw new Error(`Invalid env value: ${envKey}=${raw}`);
    }

    return value;
  }
}
