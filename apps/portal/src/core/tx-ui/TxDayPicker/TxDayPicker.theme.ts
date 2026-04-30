import { TxClassBase, TxClassBorder, TxClassFocus, TxClassHover } from '../TxTheme';

export const TxDayPickerTheme = {
  wrapper: `relative inline-block w-[10em] rounded-md shadow-sm ${TxClassBorder} ${TxClassBase} focus:outline-none`,
  input: 'text-center',
  focus: TxClassFocus,
  panel: `tx-daypicker-panel absolute z-50 mt-1 rounded-md p-2 shadow-lg ${TxClassBorder} ${TxClassBase}`,
  calendar: {
    root: 'p-1',
    months: 'flex flex-col gap-3 sm:flex-row',
    month: 'space-y-3 rounded-lg p-2 shadow-sm',
    caption: 'relative flex items-center justify-center px-8 text-sm font-medium',
    caption_label: 'text-gray-900 dark:text-white',
    nav: 'absolute inset-x-0 top-0 flex items-center justify-between',
    button_previous: `inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-700 dark:text-gray-200 ${TxClassHover}`,
    button_next: `inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-700 dark:text-gray-200 ${TxClassHover}`,
    month_grid: 'w-full border-collapse',
    weekdays: 'flex',
    weekday: 'flex-1 text-center text-xs font-bold text-gray-500 dark:text-gray-400',
    week: 'mt-1 flex',
    day: 'flex flex-1 items-center justify-center',
    day_button: `flex h-9 w-9 items-center justify-center rounded-md text-sm transition-colors ${TxClassHover}`,
    today: 'font-semibold text-blue-600 dark:text-blue-300',
    outside: 'text-gray-400 dark:text-gray-500 opacity-60',
    disabled: 'cursor-not-allowed opacity-40',
    hidden: 'invisible',
    selected: 'bg-blue-500 text-white hover:bg-blue-500 dark:bg-blue-400 dark:text-gray-900 dark:hover:bg-blue-400',
    range_start: 'rounded-l-md bg-blue-600 text-white hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-500',
    range_end: 'rounded-r-md bg-blue-600 text-white hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-500',
    range_middle: 'rounded-none bg-blue-100 text-gray-900 dark:bg-blue-900 dark:text-white',
  },
};

export const DAY_PICKER_CLASSNAMES = TxDayPickerTheme.calendar;

export const DAY_PICKER_MODIFIERS = {
  selected: TxDayPickerTheme.calendar.selected,
  range_start: TxDayPickerTheme.calendar.range_start,
  range_end: TxDayPickerTheme.calendar.range_end,
  range_middle: TxDayPickerTheme.calendar.range_middle,
};
