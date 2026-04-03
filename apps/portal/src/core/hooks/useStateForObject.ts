/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useState } from 'react';

/**
 * ✅ 얕은 비교 (shallow equal)
 * - key/value가 모두 동일하면 true
 * - 중첩 객체까지 깊게 비교하지는 않음
 */
function shallowEqual<T extends Record<string, any>>(a: T, b: T): boolean {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;

  for (const key of aKeys) {
    if (a[key] !== b[key]) return false;
  }
  return true;
}

/**
 * ✅ useUpdateState
 *
 * React의 useState를 기반으로 한 커스텀 훅으로,
 * 상태를 "업데이트(update)" 방식으로 병합하여 관리할 수 있게 해줍니다.
 *
 * ⛳ 사용 목적:
 * - form, filter, query params처럼 일부 필드만 수정하는 상황에 적합
 * - 전체 객체를 대체하지 않고, 기존 상태를 유지한 채 일부 필드만 병합
 * - 전체 객체를 대체하려면 함수형 업데이트 구문을 직접 사용: setFilters(prev => ({ page: prev.page + 1 }));
 *
 * ✅ 주요 기능:
 * - Partial<T> 또는 함수형 업데이트 지원
 * - 동일한 상태로 setState를 호출해도 렌더링 방지 (얕은 비교)
 * - update 함수는 항상 최신 상태(`T`)를 반환
 *   ⚠ 단, 반환값은 React state와 즉시 동기화된 값이 아니며,
 *     "예상되는 최신 상태(nextState)"임에 유의해야 합니다.
 *
 * @param initialValue 상태의 초기값 (Record<string, any> 형태)
 * @returns [state, update]
 *   - state: 현재 상태값 (렌더링과 동기화됨)
 *   - update: 상태를 병합 업데이트하는 함수
 *             (Partial<T> | 함수형 업데이트 가능, 리턴 타입은 T)
 *
 * @example
 * const [filters, setFilters] = useUpdateState({ providerTag: "", keyword: "", page: 1 });
 *
 * // 일부 필드만 변경
 * const next1 = setFilters({ keyword: "kim" });
 * // next1: { providerTag: "", keyword: "kim", page: 1 }
 * // 단, state는 다음 렌더링에서야 반영됨
 *
 * // 함수형 업데이트
 * const next2 = setFilters(prev => ({ page: prev.page + 1 }));
 * // next2: { providerTag: "", keyword: "kim", page: 2 }
 */

export function useStateForObject<T extends Record<string, any>>(initialValue: T) {
  const [state, _state] = useState<T>(initialValue);

  const update = useCallback((patch: Partial<T> | ((prev: T) => Partial<T>)) => {
    _state((prev) => {
      const nextPatch = typeof patch === 'function' ? patch(prev) : patch;
      const nextState = { ...prev, ...nextPatch };

      // ✅ 렌더링 최소화를 위해 shallowEqual 사용
      if (shallowEqual(prev, nextState)) return prev;

      return nextState;
    });
  }, []);

  return [state, update] as const;
}
/* eslint-enable @typescript-eslint/no-explicit-any */
