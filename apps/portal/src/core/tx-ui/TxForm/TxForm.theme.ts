import { TxClassBase } from '../TxTheme';

export const TxFormTheme = {
  wrapper: 'flex flex-col gap-3',
  flex: 'flex gap-2',
  label: 'text-sm font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap',
  field: {
    container: 'relative flex',
    caption: 'absolute -top-2 left-1 px-1 z-[1] text-xs whitespace-nowrap text-gray-500 dark:text-gray-400 font-bold overflow-hidden',
    warning: 'absolute -bottom-5 left-0 z-[1] text-xs whitespace-nowrap text-yellow-300 font-bold overflow-hidden',
    error: 'absolute -bottom-5 left-0 z-[1] text-xs whitespace-nowrap text-red-500 font-bold overflow-hidden',
    readOnly: '!bg-gray-200 !text-gray-400 dark:!bg-gray-700 dark:!text-gray-400',
    surface: TxClassBase,
  },
};
