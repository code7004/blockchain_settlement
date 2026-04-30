import type { DayPickerLocale, Matcher } from 'react-day-picker';
import type { DeepPartial, TxDayPickerTheme } from '..';

export interface ITxDayPickerProps {
  className?: string;
  value?: Date;
  onChange?: (date: Date) => void;
  disableAutoClose?: boolean;
  placeholder?: string;
  format?: string;
  theme?: DeepPartial<typeof TxDayPickerTheme>;
}

export interface ITxDayPickerByRangeProps {
  className?: string;
  value: Date[] | number[];
  onChange?: (range: Date[]) => void;
  onChangeNums?: (range: number[]) => void;
  placeholder?: string;
  disableAutoClose?: boolean;
  format?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  disabled?: Matcher | Matcher[] | undefined;
  diffBlock?: number;
  locale?: Partial<DayPickerLocale> | undefined;
  theme?: DeepPartial<typeof TxDayPickerTheme>;
}
