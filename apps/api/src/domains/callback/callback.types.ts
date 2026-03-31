export type DepositConfirmedCallbackBody = {
  event: string;
  depositId: string;
  externalUserId: string;
  txHash: string;
  amount: string;
  tokenSymbol: string;
  confirmedAt: string;
};

export type CallbackHeaders = Record<string, string>;
