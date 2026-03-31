/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { type ReactNode } from 'react';
import { TxCoolTablePagenationTheme, TxCoolTableTheme } from '.';
import { type DeepPartial } from '..';

export type ITxCoolTableSortType = 'asc' | 'desc' | 'none' | undefined;

export interface ITxCoolTable<T extends Record<string, unknown> = any> {
  id?: string;
  caption?: string;
  data: T[];
  options?: ITxCoolTableOption;
  theme?: DeepPartial<typeof TxCoolTableTheme>;
  className?: string;
  renderBody?: (props: ITxCoolTableRenderBodyProps<T>) => ReactNode;
  renderHead?: (props: ITxCoolTableRenderHeadProps<T>) => ReactNode;
  locale?: (key: string) => string;
  // auto → 셀 내용(content)을 보고 브라우저가 열 너비를 계산 (기본값)
  // fixed → 첫 번째 행(헤더) 기준으로 열 너비를 강제. 성능 ↑
  tableLayout?: 'auto' | 'fixed';
  /**
   * defaultSort
   * -------------------------------------------------------------------
   * - 서버에서 이미 정렬된 데이터를 내려준 경우,
   *   현재 어떤 컬럼이 정렬 상태인지 UI에 "표시"만 한다.
   * - 클라이언트에서 데이터를 정렬하지는 않는다.
   * - 정렬 상태는 onClickHeader 이벤트로 상위에 전달되어,
   *   서버 재조회 시 사용된다.
   */
  defaultSort?: { key: string; order: ITxCoolTableSortType };

  // ✅ 선택 기능 관련
  useCheckBox?: boolean;
  useMultiSelect?: boolean;
  useRowSelect?: boolean;
  onClickHeader?: (props: { key: string; value: ITxCoolTableSortType }) => void;
  onChangeCell?: (change: ITxCoolTableChangeCellEvent<T>) => Promise<boolean> | boolean;
  onSelections?: (items: T[]) => Promise<void> | void;
}

export interface ITxCoolTableOption {
  hiddenHeader?: boolean;
  headerKeySeparator?: boolean; // key에 "." 있을 때 중첩 접근 허용 여부
  headers?: string[]; // 표시할 헤더 목록 (없으면 data의 key 사용)
  addHeaders?: string[]; // headers외에 추가할 헤더목록
  hiddenHeaders?: string[]; // 숨길 헤더 목록
  fixables?: number[]; // sticky 적용할 열 index
  unit?: 'em' | 'px'; // 고정 셀 단위
  colWidths?: number[]; // 열 너비 (없으면 auto)
  sortColumns?: '*' | 'none' | string[]; // 정렬 가능한 컬럼 지정
  editColumns?: '*' | string[]; // 편집 허용 컬럼
  bodyStyles?: Record<string, React.CSSProperties>; // body 스타일 매핑
  headStyles?: Record<string, React.CSSProperties>; // head 스타일 매핑
}

export interface ITxCoolTableChangeCellEvent<T extends Record<string, any> = any, ExtraKey extends string = never> {
  row: number;
  col: number;
  key: Extract<keyof T, string> | ExtraKey;
  oldValue: any;
  newValue: any;
  rowdata: T;
}

export interface ITxCoolTableRenderBodyProps<T extends Record<string, any> = any, ExtraKey extends string = never> {
  value: any;
  row: number;
  sort: ITxCoolTableSortType;
  col: number;
  key: Extract<keyof T, string> | ExtraKey;
  rowdata: T;
  element?: ReactNode;
  onChangeCell?: (change: ITxCoolTableChangeCellEvent<T>) => void;
}

export interface ITxCoolTableRenderHeadProps<T extends Record<string, any> = any, ExtraKey extends string = never> {
  colIdx?: number;
  key: Extract<keyof T, string> | ExtraKey;
  sort?: ITxCoolTableSortType;
  editEmoji?: string;
  sortEmoji?: string;
}

export interface ITxCoolTableBaseProps<T extends Record<string, unknown>> {
  styleId: string;
  theme: typeof TxCoolTableTheme;
  renderBody?: (props: ITxCoolTableRenderBodyProps<T>) => ReactNode;
  checked: boolean;
  row: number;
  rowdata: T;
  editable: boolean;
  onChangeCell?: (change: ITxCoolTableChangeCellEvent<T>) => Promise<boolean> | boolean;
  onFocus?: (row: number, col: number, header: string) => void;
  locale?: (key: string) => string;
}

export interface ITxCoolTableTRProps<T extends Record<string, unknown> = any> extends ITxCoolTableBaseProps<T> {
  headers: string[];
  sorts: Record<string, ITxCoolTableSortType>;
  options: ITxCoolTableOption;
  useCheckBox: boolean;
  onToggleRow: (row: number) => void;
  onClickRow: (row: number) => void;
}

export interface ITxCoolTableTDProps<T extends Record<string, unknown> = Record<string, unknown>> extends ITxCoolTableBaseProps<T> {
  col: number;
  sort: ITxCoolTableSortType;
  header: Extract<keyof T, string>;
  style: React.CSSProperties;
  value?: unknown;
}

export interface ITxCoolTablePaginationProps {
  itemCount: number;
  value: number;
  theme?: DeepPartial<typeof TxCoolTablePagenationTheme>;
  itemVisibleCount?: number;
  pageVisibleCount?: number;
  disableNextButton?: boolean;
  disableJumpButton?: boolean;
  onChangePage?: (page: number) => void;
  onChangePageGroup?: (page: number, group: number) => void;
  limitPage?: number;
}

export interface ITxFlexLayoutProps {
  className?: string;
  children: React.ReactElement;
  onLayout?: (evt: HTMLDivElement) => void;
  disableHScroll?: boolean;
  disableVScroll?: boolean;
  resetDetecter?: number | string | boolean | Record<string, any>;
  footer?: ReactNode;
}

export interface ITxCoolTableScrollerRef {
  getBottomState?: () => {
    isAtBottom: boolean;
    scrollHeight: number;
  };
  scrollToPrevBottomAsTop?: (prevScrollHeight: number) => void;
  resetScroll?: () => void;
  scrollToBottom?: () => void;
}

/* eslint-enable @typescript-eslint/no-explicit-any */
