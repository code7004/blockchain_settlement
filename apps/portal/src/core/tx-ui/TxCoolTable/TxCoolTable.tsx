/* eslint-disable @typescript-eslint/no-explicit-any */

import { createCSS, shortUID } from '@/core/extensions';
import _ from 'lodash';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TxCoolTableTheme } from '.';
import { cm, themeMerge } from '..';
import type { ITxCoolTable, ITxCoolTableOption, ITxCoolTableSortType, ITxCoolTableTDProps, ITxCoolTableTRProps } from './TxCoolTable.types';
import { castValue, safeRender, setNestedValue } from './TxCoolTable.utils';

/**
 * TxCoolTable
 * -------------------------------------------------------------------
 * ✅ 범용 테이블 컴포넌트
 * - 정렬 / 선택 / 편집 / 테마 적용을 지원한다.
 *
 * 📌 주요 기능
 * - 헤더/바디 렌더링 커스터마이징 (`renderHead`, `renderBody`)
 * - 체크박스 단일/다중 선택 (`useCheckBox`, `multiSelect`)
 * - 행 전체 클릭 선택 (`useRowSelect`)
 * - 셀 편집 가능 (`editColumns`)
 * - 고정 컬럼, 사용자 지정 스타일 (`fixables`, `headStyles`, `bodyStyles`)
 * - `defaultSort`(props) → 정렬 상태를 **표시만 지원**
 *   ⚠️ 실제 데이터 정렬은 서버나 외부에서 처리해야 함
 *
 * 📌 Props
 * - caption: 테이블 제목 (caption 태그로 표시)
 * - data: 테이블 데이터 배열
 * - options: ITxCoolTableOption (헤더, 정렬 가능 컬럼, 스타일 등)
 * - className: 테마 오버라이드 또는 문자열 클래스
 * - defaultSort: { key, order } → 정렬 상태 "표시용"
 * - useCheckBox: 체크박스 표시 여부
 * - multiSelect: 다중 선택 허용 여부
 * - useRowSelect: 행 클릭 시 선택 여부
 * - onClickHeader: 헤더 클릭 시 콜백 (정렬 요청 외부 전달)
 * - onSelection / onSelections: 선택된 행 데이터 콜백
 * - onChangeCell: 셀 값 변경 콜백
 *
 * 📌 사용 예시
 * ```tsx
 * <TxCoolTable
 *   data={rows}
 *   options={{
 *     headers: ["id", "name", "createdAt"],
 *     sortColumns: ["createdAt"]
 *   }}
 *   defaultSort={{ key: "createdAt", order: "desc" }}
 *   onClickHeader={({ key, value }) => fetchData({ sortKey: key, sortVal: value })}
 * />
 * ```
 */
export function TxCoolTable<T extends Record<string, any>>({
  caption,
  data,
  options,
  theme,
  className,
  locale = (k) => k,
  defaultSort,
  tableLayout = 'fixed',
  useCheckBox = false,
  useMultiSelect = false,
  useRowSelect = false,
  onSelections,
  ...rest
}: ITxCoolTable<T>) {
  const mergedTheme = useMemo(() => themeMerge(TxCoolTableTheme, theme, 'override'), [theme]);
  const stableData = useMemo<T[]>(() => data ?? [], [data]);
  const stableOptions = useMemo<ITxCoolTableOption>(() => options ?? {}, [options]);
  const stableHeaders = useMemo<string[]>(() => {
    const { headers, hiddenHeaders, addHeaders = [] } = stableOptions;
    if (headers?.length && hiddenHeaders?.length) {
      console.warn('TXCoolTable Error: headers와 hiddenHeaders는 동시에 쓸 수 없음');
    }

    if (headers) return headers;

    if (stableData?.length > 0) {
      let tHeaders = Object.keys(stableData[0]);
      if (hiddenHeaders) tHeaders = _.difference(tHeaders, hiddenHeaders);
      return [...tHeaders, ...addHeaders];
    }

    return [];
  }, [stableData, stableOptions]);

  const [viewData, _viewData] = useState<T[]>(stableData);
  const [editableRows, _editableRows] = useState<Set<number>>(new Set());
  const [checkedRows, _checkedRows] = useState<Set<number>>(new Set());
  const [sortHeaders, _sortHeaders] = useState<Record<string, ITxCoolTableSortType>>({});

  const refAllCheckbox = useRef<HTMLInputElement>(null);
  const styleIdRef = useRef('tx-cool-table' + (rest.id ?? shortUID()));

  // 체크박스 전체 선택 여부
  const allChecked = stableData.length > 0 && checkedRows.size === stableData.length;
  // 전체 선택 여부 / indeterminate 계산
  const partiallyChecked = checkedRows.size > 0 && checkedRows.size < stableData.length;
  const styleId = styleIdRef.current;

  const rowKeyMap = useRef<WeakMap<object, string>>(new WeakMap());

  // ✅ 정렬 헤더 연속 클릭 방지용 debounce 타이머
  const sortDebounceRef = useRef<number | null>(null);

  function getRowKey(row: object) {
    let key = rowKeyMap.current.get(row);
    if (!key) {
      key = shortUID();
      rowKeyMap.current.set(row, key);
    }
    return key;
  }

  // data 바뀌면 초기화
  useEffect(() => {
    _viewData(stableData);
    _checkedRows(new Set());
  }, [stableData]);

  useEffect(() => {
    _sortHeaders(() => {
      const next: Record<string, ITxCoolTableSortType> = {};
      stableHeaders.forEach((h) => {
        if (defaultSort?.key === h) {
          next[h] = defaultSort.order ?? 'asc';
        } else {
          next[h] = undefined;
        }
      });
      return next;
    });
  }, [stableHeaders, defaultSort]);

  useEffect(() => {
    if (refAllCheckbox.current) {
      refAllCheckbox.current.indeterminate = partiallyChecked;
    }
  }, [partiallyChecked]);

  useEffect(() => {
    const { fixables = [], unit = 'px', colWidths = [] } = stableOptions;
    let accumulatedLeft = 0;

    if (useCheckBox) {
      const chRawWidth = 30;
      const chWidth = chRawWidth + unit;
      createCSS(styleId, `.${styleId}-head-checkbox`, { position: 'sticky', left: 0, width: chWidth, minWidth: chWidth, maxWidth: chWidth, top: 0, zIndex: 4 });
      createCSS(styleId, `.${styleId}-body-checkbox`, { position: 'sticky', left: 0, width: chWidth, minWidth: chWidth, maxWidth: chWidth, zIndex: 2 });
      accumulatedLeft += chRawWidth;
    }

    stableHeaders.forEach((h, idx) => {
      const rawWidth = colWidths?.[idx];
      const colWidth = rawWidth != null ? rawWidth + unit : undefined;

      // ✅ 헤더 스타일
      createCSS(styleId, `.${styleId}-head-${idx}`, { position: 'sticky', top: 0, zIndex: 2, background: 'inherit', ...(colWidth ? { width: colWidth, minWidth: colWidth, maxWidth: colWidth } : {}) });

      // ✅ 스크롤바 감추기 (body 셀 공통)
      createCSS(styleId, `.${styleId}-body-${idx}`, { overflow: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }); // Firefox,IE/Edge
      createCSS(styleId, `.${styleId}-body-${idx}::-webkit-scrollbar`, { display: 'none' }); // Chrome/Safari/Edge

      // ✅ 고정 컬럼
      if (fixables.includes(idx) && rawWidth != null) {
        const width = rawWidth + unit;
        createCSS(styleId, `.${styleId}-head-${idx}`, { position: 'sticky', left: `${accumulatedLeft}${unit}`, width, minWidth: width, maxWidth: width, top: 0, zIndex: 3 });
        createCSS(styleId, `.${styleId}-body-${idx}`, { position: 'sticky', left: `${accumulatedLeft}${unit}`, width, minWidth: width, maxWidth: width, zIndex: 1, overflow: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' });
        createCSS(styleId, `.${styleId}-body-${idx}::-webkit-scrollbar`, { display: 'none' });
        accumulatedLeft += rawWidth;
      }
    });
  }, [stableHeaders, stableOptions, styleId, useCheckBox]);

  const hdSelectAll = (checked: boolean) => {
    if (checked) {
      _checkedRows(new Set(stableData.map((_, idx) => idx)));
      void onSelections?.(stableData);
    } else {
      _checkedRows(new Set());
      void onSelections?.([]);
    }
  };

  // check box
  const hdToggleRow = (row: number) => {
    _checkedRows((prev) => {
      const next = new Set(prev);

      if (!useMultiSelect) {
        next.clear();
        if (!prev.has(row)) next.add(row);
      } else if (next.has(row)) {
        next.delete(row);
      } else {
        next.add(row);
      }

      // 콜백 발행
      const selected = [...next].map((i) => stableData[i]);
      queueMicrotask(() => void onSelections?.(selected));

      return next;
    });
  };

  // 행 클릭 시 선택 (useRowSelect)
  const hdClickRow = (row: number) => {
    if (!useRowSelect || stableOptions.editColumns) return;
    hdToggleRow(row);
  };

  // sortColumns 검사 함수
  function isSortable(key: string) {
    const sortColumns = stableOptions.sortColumns;
    if (!sortColumns) return false;
    if (sortColumns === '*') return true;
    return sortColumns.includes(key);
  }

  const hdClickHeader = (key: string) => {
    if (!isSortable(key)) return;

    // 🚫 debounce 중이면 무시
    if (sortDebounceRef.current !== null) return;

    // ✅ debounce 시작
    sortDebounceRef.current = window.setTimeout(() => {
      sortDebounceRef.current = null;
    }, 200);

    _sortHeaders((prev) => {
      const nextSort = prev[key] === 'desc' ? 'asc' : 'desc';

      const next: Record<string, ITxCoolTableSortType> = {};
      stableHeaders.forEach((h) => {
        next[h] = h === key ? nextSort : undefined;
      });

      if (typeof rest.onClickHeader === 'function') {
        queueMicrotask(() => {
          rest.onClickHeader?.({ key, value: nextSort });
        });
      } else {
        if (nextSort === undefined) {
          _viewData(stableData);
        } else {
          _viewData(_.orderBy(stableData, [key], [nextSort]));
        }
      }

      return next;
    });
  };

  function hdActivateRow(row: number, col: number, header: string) {
    if (!stableOptions.editColumns || (!stableOptions.editColumns.includes(header) && !stableOptions.editColumns.includes('*'))) return;
    const newSet = new Set<number>([row]);
    if (row > 0) newSet.add(row - 1);
    if (data && row < data.length - 1) newSet.add(row + 1);
    _editableRows(newSet);
  }

  return (
    <table data-tag="TxCoolTable" className={cm(mergedTheme.table, className, `table-${tableLayout}`, viewData.length === 0 && 'h-full')}>
      {caption && <caption className={mergedTheme.caption}>{caption}</caption>}
      {!stableOptions.hiddenHeader && (
        <thead data-tag="TXCoolTable.Head">
          <tr data-tag="TXCoolTable.Head.TR" className={mergedTheme.thead.tr}>
            {useCheckBox && (
              <th className={cm(`${styleId}-head-checkbox`, mergedTheme.thead.th)}>
                <input ref={refAllCheckbox} type="checkbox" checked={allChecked} disabled={!useMultiSelect} onChange={(e) => hdSelectAll(e.target.checked)} />
              </th>
            )}
            {stableHeaders.map((key, col) => {
              const sort = sortHeaders[key] ?? 'none';
              const sortEmoji = isSortable(key) ? (sort === 'asc' ? '🔼' : sort === 'desc' ? '🔽' : '⏹️') : '';
              const editEmoji = stableOptions.editColumns && (stableOptions.editColumns === '*' || stableOptions.editColumns.includes(key)) ? '✏️' : '';
              return (
                <th key={`th-${col}`} title={key} className={cm(`${styleId}-head-${col}`, mergedTheme.thead.th, isSortable(key) && 'cursor-pointer')} onClick={() => hdClickHeader(key)} style={stableOptions.headStyles?.[key]}>
                  {rest.renderHead ? (
                    rest.renderHead({ key: key as Extract<keyof T, string>, colIdx: col, sort, sortEmoji, editEmoji })
                  ) : (
                    <div className="flex items-center justify-center gap-1">
                      <span>{editEmoji}</span>
                      <span>{locale(key)}</span>
                      <span>{sortEmoji}</span>
                    </div>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
      )}
      <tbody data-tag="TXCoolTable.Body">
        {viewData.length === 0 && (
          <tr>
            <td colSpan={stableHeaders.length + (useCheckBox ? 1 : 0)} className={cm(mergedTheme.nonData)}>
              {locale('not found data')}
            </td>
          </tr>
        )}
        {viewData.map((rowdata, row) => (
          <BodyTR<T>
            key={getRowKey(rowdata)}
            {...{ row, rowdata, styleId, useCheckBox }}
            editable={editableRows.has(row)}
            headers={stableHeaders}
            sorts={sortHeaders}
            theme={mergedTheme}
            renderBody={rest.renderBody}
            options={stableOptions}
            useCheckBox={useCheckBox}
            checked={checkedRows.has(row)}
            onToggleRow={hdToggleRow}
            onClickRow={hdClickRow}
            onFocus={hdActivateRow}
            onChangeCell={rest.onChangeCell}
            locale={locale}
          />
        ))}
      </tbody>
    </table>
  );
}

const _BodyTR = <T extends Record<string, unknown>>({ rowdata, row, headers, sorts, theme, renderBody, styleId, useCheckBox, editable, checked, locale, onFocus, onToggleRow, onClickRow, onChangeCell, options }: ITxCoolTableTRProps<T>) => {
  function getNestedValue(obj: unknown, path: string) {
    if (!options.headerKeySeparator) {
      if (obj && typeof obj === 'object' && path in obj) {
        return (obj as Record<string, unknown>)[path];
      }
      return undefined;
    }

    if (!obj || typeof path !== 'string') return undefined;

    const keys = path.split('.');
    let acc: unknown = obj;

    for (let i = 0; i < keys.length; i++) {
      if (acc == null || typeof acc !== 'object') return undefined;

      const record = acc as Record<string, unknown>;
      acc = record[keys[i]];
    }

    return acc;
  }

  return (
    <tr data-tag="TXCoolTable.Body.TR" className={cm(theme.tbody.tr, checked ? theme.state.checked : theme.state.hover)} onClick={() => onClickRow(row)}>
      {useCheckBox && (
        <td className={cm(`${styleId}-body-checkbox`, theme.tbody.td)} onClick={() => onToggleRow(row)}>
          <input type="checkbox" checked={checked} onChange={(e) => (onToggleRow(row), e.stopPropagation())} onClick={(e) => e.stopPropagation()} />
        </td>
      )}
      {headers.map((header, col) => {
        const isEditableCol = options.editColumns === '*' || options.editColumns?.includes(header);
        return (
          <BodyTD
            key={`td-${col}`}
            {...({
              col,
              header,
              sort: sorts[header],
              editable: editable && isEditableCol,
              row,
              locale,
              rowdata,
              styleId,
              theme,
              style: options.bodyStyles?.[header],
              checked,
              renderBody,
              onChangeCell: isEditableCol ? onChangeCell : undefined,
              onFocus,
            } as ITxCoolTableTDProps)}
            value={getNestedValue(rowdata, header)}
          />
        );
      })}
    </tr>
  );
};

export const BodyTR = React.memo(
  _BodyTR,
  // (prev, next) => prev.checked === next.checked && prev.editable === next.editable && prev.rowdata === next.rowdata && prev.headers === next.headers
  (prev, next) => {
    // ✅ 체크 상태 / 편집 상태가 변하면 리렌더
    if (prev.checked !== next.checked) return false;
    if (prev.editable !== next.editable) return false;

    // ✅ rowdata 비교 (shallow 비교)
    // if (!_.isEqual(prev.rowdata, next.rowdata)) return false;
    if (prev.rowdata !== next.rowdata) return false;

    // ✅ headers shallow 비교 (보통 stable하므로 생략 가능)
    if (prev.headers.length !== next.headers.length) return false;
    if (prev.headers.some((h, i) => h !== next.headers[i])) return false;

    // ✅ sort 상태 비교 (일반적으로 rowdata 변경으로 충분하지만 필요시 활성화)
    // if (Object.keys(prev.sorts).length !== Object.keys(next.sorts).length) return false;
    // if (Object.entries(prev.sorts).some(([key, val]) => next.sorts[key] !== val)) return false;

    return true; // 변경 없음 → 리렌더링 생략
  },
) as typeof _BodyTR;

const _BodyTD = <T extends Record<string, unknown>>({ value, row, col, header, sort, styleId, checked, rowdata, editable, style, locale, theme, renderBody, onChangeCell, onFocus }: ITxCoolTableTDProps<T>) => {
  // ✅ 표시용 값만 따로 계산
  const displayValue = renderBody ? renderBody({ value, row, col, key: header, sort, rowdata }) : locale?.(value as string);

  async function hdBlur(e: React.FocusEvent<HTMLDivElement, Element>) {
    const target = e.currentTarget;
    const rawValue = target.textContent ?? '';
    const casted = castValue(value, rawValue);
    if (casted !== value) {
      const newRow = setNestedValue(rowdata, header, casted);
      const result = await onChangeCell?.({ row, col, key: header, oldValue: value, newValue: casted, rowdata: newRow as T });
      if (!result) {
        target.textContent = (value || '') as string;
      }
    }
  }

  function hdKeyDown(e: React.KeyboardEvent<HTMLTableCellElement>) {
    if (e.key === 'Enter') {
      if (e.shiftKey) return; // 줄바꿈 허용
      e.preventDefault();

      if (e.ctrlKey) {
        const nextRow = document.querySelector<HTMLTableCellElement>(`[data-tag="TXCoolTable.Body.TD"][data-styleid="${styleId}"][data-row="${row + 1}"][contenteditable="true"]`);
        nextRow?.focus();
      } else {
        const nextRow = document.querySelector<HTMLTableCellElement>(`[data-tag="TXCoolTable.Body.TD"][data-styleid="${styleId}"][data-row="${row + 1}"][data-col="${col}"][contenteditable="true"]`);
        nextRow?.focus();
      }
    }
  }

  function hdOpenCell(e: React.FocusEvent<HTMLTableDataCellElement>) {
    e.stopPropagation();
    onFocus?.(row, col, header);
  }

  return (
    <td
      data-tag="TXCoolTable.Body.TD"
      data-styleid={styleId}
      data-row={row}
      data-col={col}
      tabIndex={editable ? 0 : -1}
      contentEditable={editable}
      suppressContentEditableWarning
      className={cm(`${styleId}-body-${col}`, theme.tbody.td, checked && theme.state.checked, editable && theme.state.editable)}
      onFocus={hdOpenCell}
      onBlur={(e) => void hdBlur(e)}
      onKeyDown={hdKeyDown}
      style={style}
    >
      {safeRender(editable ? value : displayValue)}
    </td>
  );
};

export const BodyTD = React.memo(_BodyTD, (prev, next) => prev.value === next.value && prev.checked === next.checked && prev.editable === next.editable) as typeof _BodyTD;
/* eslint-enable @typescript-eslint/no-explicit-any */
