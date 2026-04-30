import dayjs from 'dayjs';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DayPicker, type DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { DAY_PICKER_MODIFIERS, TxDayPickerTheme, type ITxDayPickerByRangeProps } from '.';
import TxInputLike from '../TxInput/TxInputLike';
import { cm, themeMerge } from '../tx-ui.utils';

function getRangeKey(range: DateRange | undefined) {
  if (!range?.from && !range?.to) return 'empty';

  return `${range?.from?.getTime() ?? 'none'}:${range?.to?.getTime() ?? 'none'}`;
}

export const TxDayPickekRange: React.FC<ITxDayPickerByRangeProps> = ({
  className,
  diffBlock,
  format = 'YYYY-MM-DD',
  value,
  disabled,
  onChange,
  onChangeNums: onChangeNum,
  placeholder = '기간을 선택 하세요.',
  disableAutoClose = true,
  header,
  footer,
  locale,
  theme,
}) => {
  const stableTheme = useMemo(() => themeMerge(TxDayPickerTheme, theme, 'override'), [theme]);
  const committedRange = useMemo<DateRange | undefined>(() => {
    if (!value || value.length < 2 || value[0] == null || value[1] == null) return undefined;

    return {
      from: new Date(value[0]),
      to: new Date(value[1]),
    };
  }, [value]);
  const committedRangeKey = useMemo(() => getRangeKey(committedRange), [committedRange]);
  const [draftState, _draftState] = useState<{ range: DateRange | undefined; sourceKey: string } | undefined>(undefined);
  const [open, _open] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const activeDraft = draftState?.sourceKey === committedRangeKey ? draftState.range : undefined;
  const range = activeDraft ?? committedRange;
  const initialMonth = range?.from ?? committedRange?.from;

  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    const wrapper = pickerRef.current;
    if (!panel || !wrapper) return;

    const panelRect = panel.getBoundingClientRect();

    panel.style.left = '0';
    panel.style.right = 'auto';
    panel.style.top = '100%';
    panel.style.bottom = 'auto';

    if (panelRect.right > window.innerWidth) {
      panel.style.left = 'auto';
      panel.style.right = '0';
    }

    if (panelRect.left < 0) {
      panel.style.left = '0';
      panel.style.right = 'auto';
    }

    if (panelRect.bottom > window.innerHeight) {
      panel.style.top = 'auto';
      panel.style.bottom = '100%';
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        _open(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) return;

    const hd = () => _open(false);

    window.addEventListener('resize', hd);
    window.addEventListener('scroll', hd, true);
    return () => {
      window.removeEventListener('resize', hd);
      window.removeEventListener('scroll', hd, true);
    };
  }, [open]);

  const hdSelect = (selectedRange: DateRange | undefined) => {
    if (!selectedRange?.from || !selectedRange?.to) {
      _draftState({ range: selectedRange, sourceKey: committedRangeKey });
      return;
    }

    let from = dayjs(selectedRange.from).startOf('day');
    const to = dayjs(selectedRange.to).endOf('day');

    if (diffBlock && to.diff(from, 'day') > diffBlock) {
      alert(`최대 ${diffBlock}일까지만 선택할 수 있습니다. 자동 보정되었습니다.`);
      from = to.subtract(diffBlock - 1, 'day');
    }

    const finalRange: DateRange = { from: from.toDate(), to: to.toDate() };
    _draftState({ range: finalRange, sourceKey: committedRangeKey });

    if (!finalRange.from || !finalRange.to) return;

    onChange?.([finalRange.from, finalRange.to]);
    onChangeNum?.([finalRange.from.getTime(), finalRange.to.getTime()]);

    if (!disableAutoClose) _open(false);
  };

  const displayValue = range?.from && range?.to ? `${dayjs(range.from).format(format)} ~ ${dayjs(range.to).format(format)}` : range?.from ? `${dayjs(range.from).format(format)} ~` : '';
  const hdToggle = () => _open((prev) => !prev);

  return (
    <div ref={pickerRef} className={cm(stableTheme.wrapper, 'w-[14em]')}>
      <TxInputLike onClick={hdToggle} onKeyDown={(e) => e.key === 'Enter' && hdToggle()} value={displayValue} placeholder={placeholder} className={cm(stableTheme.input, stableTheme.focus, className)} />
      {open && (
        <div ref={panelRef} role="dialog" className={stableTheme.panel}>
          {header}
          <DayPicker disabled={disabled} locale={locale} mode="range" selected={range} onSelect={hdSelect} classNames={stableTheme.calendar} modifiersClassNames={DAY_PICKER_MODIFIERS} numberOfMonths={2} defaultMonth={initialMonth} />
          {footer}
        </div>
      )}
    </div>
  );
};
