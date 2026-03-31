import type { CallbackStatus } from '@/constants';
import { get, post, type IApiResponse } from '@/core/network';

export interface IGetAdminBlockChainWalletBalance {
  trx: number;
  token: number;
}
export function getAdminBlockChainWalletBalance(address: string) {
  return get<IApiResponse<IGetAdminBlockChainWalletBalance>>('/api/admin/blockchain/wallet-balance', { address });
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

export function getAdminBlockChainTxHashMonitor(txHash: string) {
  return get<IGetAdminBlockChainTxHashMonitor>(`/api/admin/blockchain/monitor/${txHash}`);
}

export interface IpostAdminBlockChainTestTransferForm {
  fromPrivateKey: string;
  toAddress: string;
  amount: number;
  tokenSymbol: string;
}

export function postAdminBlockChainTestTransfer(form: IpostAdminBlockChainTestTransferForm) {
  return post<IApiResponse<{ txHash: string }>>('/api/admin/blockchain/test-transfer', form);
}
