import { useEffect, useMemo, useRef, useState } from 'react';
import type { ITxDropdownData, ITxDropdownItem, TxDropdownValue } from '.';
import { TxDropdownBase } from './TxDropdownBase';
import { normalizeMulti } from './utils';

export interface ITxDropdownMultiProps {
  value?: TxDropdownValue[];
  data: ITxDropdownData;
  caption?: string;
  warning?: string;
  error?: string;
  className?: string;
  fixedHead?: string;
  defaultHead?: string;
  maxHeight?: number | string;

  locale?: (k: string) => string;

  defaultAllCheck?: boolean;

  onChangeValue?: (items: ITxDropdownItem[]) => void;
  onChangeText?: (values: string[]) => void;
  onChangeNumb?: (values: number[]) => void;
  onChangeBool?: (values: boolean[]) => void;
}

/**
 * TxDropdownMulti (Multi Select)
 *
 * @description
 * 다중 선택을 지원하는 드롭다운 컴포넌트.
 * controlled / uncontrolled 사용을 모두 지원하며,
 * 여러 개의 값을 동시에 선택할 수 있다.
 *
 * @features
 * - 다중 항목 선택
 * - controlled / uncontrolled 동시 지원
 * - 문자열, 숫자, 객체 형태의 데이터 지원
 * - 선택 개수에 따른 헤더 표시 (0개 / 일부 / 전체)
 * - 키보드 내비게이션 (Tab, Enter, Space)
 * - 외부 value 변경 시 내부 선택 상태 자동 동기화
 * - 다양한 타입별 onChange 콜백 제공
 *
 * @value-semantics
 * value 값에 따른 의미 정의:
 * - value === undefined
 *   → uncontrolled 모드
 *   → 내부 상태(xvalue)를 기준으로 선택 상태 관리
 *
 * - value !== undefined
 *   → controlled 모드
 *   → 외부 value 배열을 기준으로 선택 상태 동기화
 *
 * @props
 * @param {TxDropdownValue[] | undefined} value
 * 외부에서 제어하는 선택 값 배열.
 * undefined 인 경우 uncontrolled 모드로 동작한다.
 *
 * @param {ITxDropdownData} data
 * 드롭다운에 표시할 데이터 목록.
 * 문자열, 숫자, ITxDropdownItem 객체를 혼합하여 사용할 수 있다.
 *
 * @param {string} [fixedHead]
 * 헤더에 항상 고정적으로 표시할 텍스트.
 * 지정 시 선택 상태와 무관하게 우선 적용된다.
 *
 * @param {string} [defaultHead]
 * 선택된 항목이 없을 때 헤더에 표시할 기본 텍스트.
 * 기본값은 "Choose".
 *
 * @param {boolean} [defaultAllCheck]
 * value가 null, undefined일때 전체 선택으로 표기하도록 해준다
 *
 * @param {(key: string) => string} [locale]
 * 표시 텍스트를 변환하기 위한 locale 함수.
 * 기본값은 identity 함수이다.
 *
 * @param {(items: ITxDropdownItem[]) => void} [onChangeValue]
 * 선택된 전체 아이템 목록을 반환한다.
 *
 * @param {(values: string[]) => void} [onChangeText]
 * 선택된 값들을 문자열 배열로 반환한다.
 *
 * @param {(values: number[]) => void} [onChangeNumb]
 * 선택된 값들을 숫자 배열로 반환한다.
 *
 * @param {(values: boolean[]) => void} [onChangeBool]
 * 선택된 값들을 boolean 배열로 반환한다.
 *
 * @remarks
 * - 내부적으로 `xvalue` 상태를 사용하여 uncontrolled 모드를 지원한다.
 * - Base 컴포넌트는 value 개념을 알지 않으며, UI / 인터랙션만 담당한다.
 * - 선택 개수에 따라 헤더는 다음과 같이 표시된다:
 *   - 0개 선택 → defaultHead
 *   - 일부 선택 → "⏹️ {count} items"
 *   - 전체 선택 → "☑️ {count} items"
 *
 * @example
 * ```tsx
 * <TxDropdown caption="선택3" multiple={true} data={DropDownData1 }} onChangeText={str => console.log(str)} locale={k => ({ Choose: "선택", "select all": "전체 선택", data1: "데이터1" })[k] ?? k} />
 * <TxDropdown caption="선택3" multiple={true} value={form.texts} data={DropDownData1} onChangeText={str => console.log(str)} />
 * <TxDropdown caption="선택3" multiple={true} value={form.texts} data={["data1", "data2", "data3", "data4", "data5"]} onChangeText={str => console.log(str)} />
 * ```
 */
export const TxDropdownMulti = ({ data, value, locale = (k) => k, fixedHead, defaultHead = 'Choose', defaultAllCheck = false, ...props }: ITxDropdownMultiProps) => {
  const [xvalue, _xvalue] = useState<TxDropdownValue[] | undefined>();

  const actualValue = value !== undefined ? value : xvalue;
  const items = useMemo(() => normalizeMulti(data, actualValue), [data, actualValue]);

  const head = useMemo(() => {
    const checkedItems = items?.filter((i) => i.checked);

    if (!checkedItems) return '';

    if (checkedItems.length === 0) {
      return locale(fixedHead || defaultHead);
    } else if (checkedItems.length === items.length) {
      return fixedHead || `☑️ ${checkedItems.length} ${locale('items')}`;
    } else {
      return fixedHead || `⏹️ ${checkedItems.length} ${locale('items')}`;
    }
  }, [items, fixedHead, defaultHead, locale]);

  const appliedDefaultAllRef = useRef(false);

  useEffect(() => {
    if (appliedDefaultAllRef.current) return;

    // uncontrolled + data 존재 + defaultAllCheck
    if (value === undefined && data?.length > 0 && defaultAllCheck) {
      const allValues = data.map((d) => (typeof d === 'object' ? d.value : d));
      _xvalue(allValues);
      appliedDefaultAllRef.current = true;
    }
  }, [data, value, defaultAllCheck]);

  useEffect(() => {
    if (value !== undefined) {
      _xvalue(value);
    }
  }, [value]);

  function hdChange(items: ITxDropdownItem[]) {
    const values = items.map((i) => i.value);

    if (value === undefined) {
      _xvalue(values); // ✅
    }

    props.onChangeValue?.(items);
    props.onChangeText?.(values as string[]);
    props.onChangeNumb?.(values as number[]);
    props.onChangeBool?.(values.map(Boolean));
  }

  return <TxDropdownBase {...props} data={items} locale={locale} head={head} multiple={true} onChangeInternal={hdChange} />;
};
