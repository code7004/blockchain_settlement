import type { SVGProps } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { ITxDropdownBaseProps, ITxDropdownItem, ITxDropdownItemProps } from '.';
import { TxDropdownTheme, cm, getItemKey, themeMerge } from '../';

export const TxDropdownBase = ({ className = '', theme, maxHeight = 500, head, data = [], locale = (k) => k, onChangeInternal, renderItem, ...props }: ITxDropdownBaseProps) => {
  const stableTheme = useMemo(() => themeMerge(TxDropdownTheme, theme, 'override'), [theme]);
  // ✅ 내부 상태
  const [visible, _visible] = useState<boolean>(false);
  const [items, _items] = useState<ITxDropdownItem[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  const refAllCheckbox = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ✅상태: 전체 체크/부분 체크 여부
  const allChecked = items.length > 0 && items.every((e) => e.checked);
  const someChecked = items.some((e) => e.checked);

  const listId = React.useId();

  // ✅ 전체선택 체크박스 상태 동기화
  useEffect(() => {
    if (refAllCheckbox.current) {
      refAllCheckbox.current.checked = allChecked;
      refAllCheckbox.current.indeterminate = !allChecked && someChecked;
    }
  }, [allChecked, someChecked, visible]);

  // ✅ options.data 변할 때 아이템 갱신
  const stableDataRef = useRef<ITxDropdownItem[] | null>(null);

  useEffect(() => {
    // ✅ 최초 1회는 무조건 반영
    if (stableDataRef.current === null) {
      stableDataRef.current = data;
      _items(data);
      return;
    }

    const prev = stableDataRef.current;

    const isSame = prev.length === data.length && prev.every((p, i) => p.value === data[i]?.value && p.checked === data[i]?.checked);

    if (isSame) return;

    stableDataRef.current = data;
    _items(data);
  }, [data]);

  // ✅ 외부 영역 클릭 시 닫기
  useEffect(() => {
    function hdClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        _visible(false);
      }
    }
    if (visible) {
      document.addEventListener('click', hdClickOutside);
    }
    return () => {
      document.removeEventListener('click', hdClickOutside);
    };
  }, [visible]);

  // ✅ 드롭다운 열기/닫기
  function hdChangeOpen(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    // 🚫 debounce 중이면 무시
    if (sortDebounceRef.current !== null) return;

    // ✅ debounce 시작 (150ms)
    sortDebounceRef.current = window.setTimeout(() => {
      sortDebounceRef.current = null;
    }, 200);

    event.stopPropagation();
    _visible((v) => !v);
    setFocusedIndex(-1);
  }

  // ✅ 정렬 헤더 연속 클릭 방지용 debounce 타이머
  const sortDebounceRef = useRef<number | null>(null);

  function hdSelectItem(item: ITxDropdownItem, event?: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    // 🚫 debounce 중이면 무시
    if (sortDebounceRef.current !== null) return;

    // ✅ debounce 시작 (150ms)
    sortDebounceRef.current = window.setTimeout(() => {
      sortDebounceRef.current = null;
    }, 200);

    event?.stopPropagation();

    if (props.multiple == true) {
      item.checked = !item.checked;
      _items([...items]);

      hdEmitChange(items.filter((e) => e.checked && e.value !== null).map((e) => ({ value: e.value, name: e.name })));
    } else {
      // blocking duple click
      if (item.checked) return;
      // all items false
      items.forEach((e) => (e.checked = false));
      // choice item
      item.checked = !item.checked;

      _items([...items]);

      _visible(false);

      hdEmitChange([item]);
    }
  }

  function hdKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (!visible && (e.key === 'Enter' || e.key == 'ArrowDown' || e.key === ' ')) {
      e.preventDefault();
      _visible(true);
      setFocusedIndex(props.multiple ? -1 : 0); // ✅ multiple이면 -1부터 시작 (전체선택 focus)
      return;
    }

    if (visible) {
      if (e.key === 'ArrowDown' || e.key === 'Tab') {
        e.preventDefault();
        setFocusedIndex((i) => (i >= items.length - 1 ? (props.multiple ? -1 : 0) : i + 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex((i) => (i <= (props.multiple ? -1 : 0) ? items.length - 1 : i - 1));
      }
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Space') {
        e.preventDefault();
        if (props.multiple && focusedIndex === -1) {
          hdSelectAll(); // 전체선택 키보드 처리
        } else if (focusedIndex >= 0) {
          hdSelectItem(items[focusedIndex]);
        }
      }
      if (e.key === 'Escape') {
        _visible(false);
      }
    }
  }

  function hdSelectAll(event?: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    // 🚫 debounce 중이면 무시
    if (sortDebounceRef.current !== null) return;

    // ✅ debounce 시작 (150ms)
    sortDebounceRef.current = window.setTimeout(() => {
      sortDebounceRef.current = null;
    }, 200);

    event?.stopPropagation();
    const temp = !allChecked; // 전체 체크 기준으로 반전
    const updated = items.map((i) => ({ ...i, checked: temp }));
    _items(updated);

    const rt = updated.filter((e) => e.checked).map((e) => ({ value: e.value, name: e.name }));

    hdEmitChange(rt);
  }

  function hdEmitChange(items: ITxDropdownItem[]) {
    onChangeInternal?.(items);
  }

  return (
    <div data-tag="TxDropdown" ref={dropdownRef} className={cm(stableTheme?.wrapper, stableTheme.focus, className)} tabIndex={0} onClick={hdChangeOpen} onKeyDown={(e) => hdKeyDown(e)} {...props}>
      {/* 선택된 값 (헤더) */}
      <div data-tag="TxDropdown.Header" role="button" aria-expanded={visible} aria-controls={listId} aria-haspopup="listbox" aria-label={head} className={stableTheme?.head}>
        <span className="flex flex-1 truncate">{head}</span>
        <Arrow className="ml-2 w-4 h-4" />
      </div>

      {/* 옵션 리스트 */}
      {visible && (
        <div id={listId} role="listbox" data-tag="TxDropdownItems" className={cm(stableTheme?.list)} style={{ maxHeight }}>
          {props.multiple && (
            <>
              <div
                data-tag="TxDropdown.Item"
                role="option"
                aria-selected={allChecked}
                tabIndex={0}
                className={cm(stableTheme?.item?.normal, (allChecked || someChecked) && stableTheme?.item?.checked, focusedIndex === -1 && stableTheme?.item?.focused)}
                onClick={hdSelectAll}
              >
                <input ref={refAllCheckbox} type="checkbox" className="mr-2 cursor-pointer" readOnly aria-label={'select-all'} />
                {locale('select all')}
              </div>
              <hr className={stableTheme?.divider} />
            </>
          )}

          {items.map((item, idx) =>
            renderItem ? (
              renderItem({
                focused: idx === focusedIndex,
                multiple: props.multiple,
                onClick: (e) => hdSelectItem(item, e),
                checked: item.checked,
                name: item.name,
                value: item.value,
              })
            ) : (
              <Item key={getItemKey(item)} name={locale(item.name)} value={item.value} multiple={props.multiple} theme={stableTheme} checked={item.checked} focused={idx === focusedIndex} onClick={(e) => hdSelectItem(item, e)} />
            ),
          )}
        </div>
      )}
    </div>
  );
};

// ✅ 드롭다운 화살표 아이콘
function Arrow(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" {...props}>
      <path fill="none" stroke="currentColor" strokeWidth="2" d="m18 9l-6 6l-6-6" />
    </svg>
  );
}

// ✅ 내부 전용 Item
const Item = React.memo(
  ({ multiple, name, value, theme, checked, focused, ...props }: ITxDropdownItemProps) => {
    return (
      <div data-tag="TxDropdown.Item" aria-selected={checked} tabIndex={0} className={cm(theme?.item?.normal, checked && theme?.item?.checked, focused && theme?.item?.focused)} data-value={value} {...props}>
        {multiple && <input type="checkbox" className="mr-2 cursor-pointer" checked={!!checked} readOnly aria-label={name} />}
        {name}
      </div>
    );
  },
  (prev, next) => prev.checked === next.checked && prev.focused === next.focused && prev.value === next.value,
);
