import React, { useEffect, useMemo } from 'react';
import type { ITxDropdownData, ITxDropdownItem, ITxDropdownProps, TxDropdownValue } from '.';
import { TxDropdownBase } from './TxDropdownBase';

// ✅ single normalize
const normalizeSingle = (data: ITxDropdownData, value: TxDropdownValue, addNoChoiceItem?: boolean): ITxDropdownItem[] => {
  if (!data) return [];

  let items: ITxDropdownItem[] = data.map((item) => (typeof item === 'object' ? { ...item, checked: false } : { name: String(item), value: item, checked: false }));

  if (addNoChoiceItem) items = [{ name: 'no select', value: undefined, checked: value === undefined }, ...items];

  if (value != null) items = items.map((i) => ({ ...i, checked: i.value === value }));

  return items;
};

/**
 * TxDropdown (Single Select)
 *
 * @description
 * 단일 선택 드롭다운 컴포넌트.
 * controlled / uncontrolled 사용을 모두 지원하며,
 * `null` 과 `undefined` 를 서로 다른 의미로 해석한다.
 *
 * @features
 * - 단일 항목 선택
 * - controlled / uncontrolled 동시 지원
 * - 문자열, 숫자, 객체 형태 데이터 지원
 * - 키보드 내비게이션 (Tab, Enter, Space)
 * - 외부 value 변경 시 내부 상태 자동 동기화
 * - 다양한 타입별 onChange 콜백 제공
 *
 * @value-semantics
 * value 값에 따른 의미 정의:
 * - value === null
 *   → 초기 상태 / 아직 선택하지 않음
 *   → 헤더에 defaultHead 표시
 *
 * - value === undefined
 *   → 명시적으로 "선택 안 함 (no select)"
 *   → addNoChoiceItem 옵션이 있을 경우 "no select" 항목이 선택됨
 *
 * - value !== null && value !== undefined
 *   → 실제 선택된 값
 *   → 해당 값에 대응하는 항목이 선택됨
 *
 * @props
 * @param {TxDropdownValue | undefined} value
 * 외부에서 제어하는 선택 값.
 * undefined 인 경우 uncontrolled 모드로 동작한다.
 *
 * @param {ITxDropdownData} data
 * 드롭다운에 표시할 데이터 목록.
 * 문자열, 숫자, ITxDropdownItem 객체를 혼합하여 사용할 수 있다.
 *
 * @param {boolean} [addNoChoiceItem]
 * true 인 경우 "no select" 항목을 자동으로 추가한다.
 *
 * @param {string} [fixedHead]
 * 헤더에 항상 고정적으로 표시할 텍스트.
 * 지정 시 선택 상태와 무관하게 우선 적용된다.
 *
 * @param {string} [defaultHead]
 * 선택된 값이 없을 때 헤더에 표시할 기본 텍스트.
 * 기본값은 "Choose".
 *
 * @param {(key: string) => string} [locale]
 * 표시 텍스트를 변환하기 위한 locale 함수.
 * 기본값은 identity 함수이다.
 *
 * @param {(item: ITxDropdownItem) => void} [onChangeValue]
 * 선택된 아이템 전체 객체를 반환한다.
 *
 * @param {(value: string) => void} [onChangeText]
 * 선택된 값이 문자열일 경우 호출된다.
 *
 * @param {(value: number) => void} [onChangeNumb]
 * 선택된 값이 숫자일 경우 호출된다.
 *
 * @param {(value: boolean) => void} [onChangeBool]
 * 선택된 값이 boolean 으로 해석될 경우 호출된다.
 *
 * @remarks
 * - 내부적으로 `xvalue` 상태를 사용하여 uncontrolled 모드를 지원한다.
 * - Base 컴포넌트는 value 개념을 알지 않으며, UI / 인터랙션만 담당한다.
 * - `undefined` 는 사용자 데이터가 아닌 내부 상태 표현용으로 예약된 값이다.
 *
 * @example
 * ```tsx
 * // controlled
 * <TxDropdown caption="선택" value={form.value} data={[1, 2, 3]} onChangeText={v => setForm({ value: v })} />
 *
 * // uncontrolled
 * <TxDropdown caption="선택" addNoChoiceItem data={["A", "B", "C"]} onChangeText={v => console.log(v)} />
 * ```
 */

export const TxDropdown = ({ data, value, locale = (k) => k, fixedHead, addNoChoiceItem, defaultHead = 'Choose', ...props }: ITxDropdownProps) => {
  const [xvalue, _xvalue] = React.useState<TxDropdownValue | undefined>(value);

  const actualValue = value !== undefined ? value : xvalue;
  const items = useMemo(() => normalizeSingle(data, actualValue, addNoChoiceItem), [data, actualValue, addNoChoiceItem]);

  const head = React.useMemo(() => {
    const checked = items.find((i) => i.checked);
    return locale(fixedHead || checked?.name || defaultHead);
  }, [items, fixedHead, defaultHead, locale]);

  useEffect(() => {
    if (value !== undefined) {
      _xvalue(value);
    }
  }, [value]);

  function hdChange(items: ITxDropdownItem[]) {
    const item = items[0];
    if (!item) return;

    if (value === undefined) _xvalue(item.value);

    props.onChangeValue?.(item);
    props.onChangeText?.(item.value as string);
    props.onChangeNumb?.(item.value as number);
    props.onChangeBool?.(Boolean(item.value));
  }

  return <TxDropdownBase {...props} data={items} locale={locale} head={head} multiple={false} onChangeInternal={hdChange} />;
};
