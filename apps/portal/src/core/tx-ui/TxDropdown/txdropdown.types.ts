/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ReactNode } from 'react';
import type { DeepPartial, ITxDropdownMultiProps, TxDropdownTheme } from '..';

/**
 * -------------------------------------------------------
 * 🔹 기본 Item 타입
 * -------------------------------------------------------
 */
export interface ITxDropdownItem<T = unknown> {
  name: string;
  value?: T;
  checked?: boolean;
}

/**
 * -------------------------------------------------------
 * 🔹 Data 정의 (원본 입력 타입)
 * -------------------------------------------------------
 */
export type ITxDropdownData = ReadonlyArray<string | number | boolean> | ReadonlyArray<ITxDropdownItem<any>>;

/**
 * -------------------------------------------------------
 * 🔹 🔥 핵심: Data 기반 Value 추론
 * -------------------------------------------------------
 */
export type InferDropdownValue<TData> = TData extends ReadonlyArray<infer U> ? (U extends ITxDropdownItem<infer V> ? V : U) : never;

/**
 * -------------------------------------------------------
 * 🔹 Item Props
 * -------------------------------------------------------
 */
export interface ITxDropdownItemProps extends ITxDropdownItem, React.HTMLAttributes<HTMLDivElement> {
  checked?: boolean;
  focused: boolean;
  multiple: boolean;
  theme?: DeepPartial<typeof TxDropdownTheme>;
}

/**
 * -------------------------------------------------------
 * 🔹 Base Props
 * -------------------------------------------------------
 */
export interface ITxDropdownBaseProps<TValue = any> {
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

  onChangeInternal?: (items: ITxDropdownItem<TValue>[]) => void;
}

/**
 * -------------------------------------------------------
 * 🔹 🔥 메인 Props (infer 적용)
 * -------------------------------------------------------
 */
export interface ITxDropdownProps<TData extends ITxDropdownData = ITxDropdownData> {
  value?: InferDropdownValue<TData>;
  data: TData | undefined;

  warning?: string;
  error?: string;
  className?: string;
  fixedHead?: string;
  defaultHead?: string;
  addNoChoiceItem?: boolean;

  locale?: (k: string) => string;

  // 🔥 자동 추론됨
  onChangeValue?: (item: ITxDropdownItem<InferDropdownValue<TData> | undefined>) => void;

  onChangeText?: (value: string | undefined) => void;
  onChangeNumb?: (value: number | undefined) => void;
  onChangeBool?: (value: boolean | undefined) => void;
}

/**
 * -------------------------------------------------------
 * 🔹 Field Props
 * -------------------------------------------------------
 */
export interface ITxFieldDropdownProps<TData extends ITxDropdownData = ITxDropdownData> extends ITxDropdownProps<TData> {
  caption?: string;
}

export interface ITxFieldDropdownMultiProps<TData extends ITxDropdownData = ITxDropdownData> extends ITxDropdownMultiProps<TData> {
  caption?: string;
}

/* eslint-enable @typescript-eslint/no-explicit-any */
