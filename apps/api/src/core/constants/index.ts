export const PAGINATION_DEFAULT_LIMIT = 20;
export const PAGINATION_MAX_LIMIT = 100;
export const PAGINATION_MAX_OFFSET = 9900;

export const CONFIRMATION_COUNT = 5;
export const CALLBACK_MAX_ATTEMPTS = 3;

export const CALLBACK_EVENT_TYPE = {
  CONFIRMED: 'CONFIRMED',
} as const;

/**
 * Sweep Constants
 *
 * Deposit wallet의 잔액이 해당 금액 이상일 때
 * Hot Wallet으로 Sweep 수행
 */
export const USDT_SWEEP_MIN_AMOUNT = 1;

export const MIN_TRX_FOR_SWEEP = 0.1; // sweep 실행 최소 TRX
export const REFILL_TRX_AMOUNT = 10; // refill전송량
