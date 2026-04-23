import { Prisma } from '@prisma/client';

export type DepositWithUser = Prisma.DepositGetPayload<{
  include: { user: true };
}>;

export type DepositWithPartner = Prisma.DepositGetPayload<{
  include: { partner: true };
}>;

export type DepositWithRelations = Prisma.DepositGetPayload<{
  include: {
    partner: true;
    user: true;
  };
}>;

export type CreateDetectedDepositInput = {
  partnerId: string;
  userId: string;
  walletId: string;

  tokenSymbol: string; // 'USDT'
  tokenContract: string; // TRC20 USDT contract

  txHash: string;
  fromAddress: string;
  toAddress: string;

  amount: string; // ⚠️ 정밀도 이슈 방지: string으로 저장/전달 권장
  blockNumber: number;

  writer: string;
  detectedAt: Date;
};
