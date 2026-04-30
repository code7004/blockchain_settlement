import dayjs from 'dayjs';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { DAY_PICKER_MODIFIERS, TxDayPickerTheme, type ITxDayPickerProps } from '.';
import TxInputLike from '../TxInput/TxInputLike';
import { cm, themeMerge } from '../tx-ui.utils';

export const TxDayPicker: React.FC<ITxDayPickerProps> = ({ className, value, onChange, placeholder = '날짜 선택', disableAutoClose, format = 'YYYY-MM-DD', theme }) => {
  const stableTheme = useMemo(() => themeMerge(TxDayPickerTheme, theme, 'override'), [theme]);
  const [selected, _selected] = useState<Date | undefined>(value);
  const [open, _open] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

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
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        _open(false);
      }
    }

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

  useEffect(() => {
    _selected(value);
  }, [value]);

  const hdSelect = (date: Date | undefined) => {
    if (!date) return;

    const normalized = dayjs(date).startOf('day').toDate();
    _selected(normalized);
    onChange?.(normalized);

    if (!disableAutoClose) _open(false);
  };

  const displayValue = selected ? dayjs(selected).format(format) : '';
  const hdToggle = () => _open((prev) => !prev);

  return (
    <div ref={pickerRef} className={stableTheme.wrapper}>
      <TxInputLike onClick={hdToggle} onKeyDown={(e) => e.key === 'Enter' && hdToggle()} value={displayValue} placeholder={placeholder} className={cm(stableTheme.input, stableTheme.focus, className)} />
      {open && (
        <div ref={panelRef} role="dialog" className={stableTheme.panel}>
          <DayPicker mode="single" selected={selected} onSelect={hdSelect} classNames={stableTheme.calendar} modifiersClassNames={DAY_PICKER_MODIFIERS} />
        </div>
      )}
    </div>
  );
};
