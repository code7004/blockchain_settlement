import { apiget, type GetTableQueryDto, type IApiResponse } from '@/core/network';
import { removeUndefined } from '@/core/network/api.utils';

export enum WithdrawalStatus {
  REQUESTED = 'REQUESTED',
  APPROVED = 'APPROVED',
  BROADCASTED = 'BROADCASTED',
  FAILED = 'FAILED',
}

export type IWithdrawal = {
  /**
   * PK
   */
  id: string;
  /**
   * 소속
   */
  partnerId: string;
  userId: string;
  walletId: string;
  /**
   * 토큰
   */
  tokenSymbol: string;
  tokenContract: string;
  /**
   * 수신 주소
   */
  toAddress: string;
  /**
   * 금액
   */
  amount: number;
  /**
   * 상태
   */
  status: WithdrawalStatus;
  /**
   * 트랜잭션 정보
   */
  txHash: string | null;
  blockNumber: bigint | null;
  /**
   * 상태 시간
   */
  requestedAt: Date | null;
  approvedAt: Date | null;
  broadcastedAt: Date | null;
  /**
   * 실패 사유
   */
  failReason: string | null;
  /**
   * 생성 / 수정
   */
  createdAt: Date;
  updatedAt: Date;
};
export type IWithdrawalGetDto = Pick<IWithdrawal, 'partnerId'> & GetTableQueryDto;

export function apiGetWithdrawals(params?: IWithdrawalGetDto) {
  return apiget<IApiResponse<IWithdrawal[]>>('/portal/withdrawals', removeUndefined(params));
}
