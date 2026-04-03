import { apiget, apipost, type IApiResponse } from '@/core/network';
import type { CallbackStatus } from '../callback/callback.api';

export interface IGetAdminBlockChainWalletBalance {
  trx: number;
  token: number;
}
export function apiGetBlockChainWalletBalance(address: string) {
  return apiget<IApiResponse<IGetAdminBlockChainWalletBalance>>('/portal/blockchain/wallet-balance', { address });
}

interface IGetAdminBlockChainTxHashMonitorStep {
  step: string;
  success: true;
  txHash: string;
  status: CallbackStatus;
}

export interface IGetAdminBlockChainTxHashMonitor {
  txHash: string;
  steps: IGetAdminBlockChainTxHashMonitorStep[];
}

export function apiGetAdminBlockChainTxHashMonitor(txHash: string) {
  return apiget<IGetAdminBlockChainTxHashMonitor>(`/portal/blockchain/monitor/${txHash}`);
}

export interface IpostAdminBlockChainTestTransferForm {
  fromPrivateKey: string;
  toAddress: string;
  amount: number;
  tokenSymbol: string;
}

export function apiPostAdminBlockChainTestTransfer(form: IpostAdminBlockChainTestTransferForm) {
  return apipost<IApiResponse<{ txHash: string }>>('/portal/blockchain/test-transfer', form);
}
