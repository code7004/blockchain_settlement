export type Trc20Contract = {
  balanceOf(address: string): { call(): Promise<unknown> };
  decimals(): { call(): Promise<unknown> };
  transfer(
    to: string,
    amount: string | number,
  ): {
    send(options: { feeLimit: number }): Promise<unknown>;
  };
};

export interface ITronContractEvent {
  block_number: number; // 블록 번호
  block_timestamp: number; // ms

  caller_contract_address: string; // backward compatibility
  contract_address: string; // 이벤트 발생 컨트랙트 주소

  event_index: string; // tx 내 이벤트 index
  event_name: string; // ex: "Transfer"
  event: string; // ex: "Transfer(address,address,uint256)"

  transaction_id: string; // tx hash

  result: Record<string, string>; // 이벤트 파라미터
  result_type: Record<string, string>; // 타입 정보

  _unconfirmed: boolean; // true = 미확정
}

export interface ITronContractEventResponse {
  success: boolean;

  data: ITronContractEvent[];

  meta: {
    page_size: number;
    at: number; // timestamp (ms)

    // pagination 대응 (있을 수도 있음)
    fingerprint?: string;
  };
}
