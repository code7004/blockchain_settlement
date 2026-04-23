export function isUUID(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

/**
 * 일정 시간(ms) 동안 대기합니다.
 * @param millisecond 지연 시간 (기본값: 1000ms)
 * @returns 지정된 시간(ms) 후에 resolve되는 Promise
 */
export async function waitForMiliSeconds(millisecond: number = 1000): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, millisecond));
}
