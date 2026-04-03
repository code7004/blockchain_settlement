import type { ReactNode } from 'react';
import type { DeepPartial, ITxDropdownMultiProps, TxDropdownTheme } from '..';

// 드롭다운 아이템 타입
export interface ITxDropdownItem {
  name: string;
  value?: string | number | boolean | ITxDropdownItem | null;
  checked?: boolean;
}

// 데이터 타입 (문자, 숫자, 객체 가능)
export type ITxDropdownData = ReadonlyArray<string | number | boolean | ITxDropdownItem>;

// value 타입 별도 분리
export type TxDropdownValue = string | number | boolean | ITxDropdownItem | null | undefined;

// ✅ Item Props
export interface ITxDropdownItemProps extends ITxDropdownItem, React.HTMLAttributes<HTMLDivElement> {
  checked?: boolean;
  focused: boolean;
  multiple: boolean;
  theme?: DeepPartial<typeof TxDropdownTheme>;
}

// ✅ 공통 Props
export interface ITxDropdownBaseProps {
  warning?: string;
  error?: string;
  data: ITxDropdownItem[];
  className?: string;
  iconClassName?: string;
  head?: string;
  multiple: boolean;
  maxHeight?: number | string;
  theme?: DeepPartial<typeof TxDropdownTheme>;

  locale?: (item: string) => string;
  renderItem?: (props: ITxDropdownItemProps) => ReactNode;

  /** 내부 공통 change handler */
  onChangeInternal?: (items: ITxDropdownItem[]) => void;
}

export interface ITxDropdownProps {
  value?: TxDropdownValue;
  data: ITxDropdownData | undefined;
  warning?: string;
  error?: string;
  className?: string;
  fixedHead?: string;
  defaultHead?: string;
  addNoChoiceItem?: boolean;
  maxHeight?: number | string;

  locale?: (k: string) => string;

  onChangeValue?: (item: ITxDropdownItem) => void;
  onChangeText?: (value: string | undefined) => void;
  onChangeNumb?: (value: number | undefined) => void;
  onChangeBool?: (value: boolean | undefined) => void;
}

export interface ITxFieldDropdownMultiProps extends ITxDropdownMultiProps {
  caption?: string;
}

export interface ITxFieldDropdownProps extends ITxDropdownProps {
  caption?: string;
}
