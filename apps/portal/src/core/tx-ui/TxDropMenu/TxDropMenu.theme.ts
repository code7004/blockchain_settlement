import { TxClassBorderColor, TxClassHover, TxClassTheme } from '..';

// ------------------- DropPanel -------------------
export const TxDropMenuTheme = {
  wrapper: 'relative inline-block',
  label: 'cursor-pointer select-none',
  panel: `absolute left-0 top-full min-w-[10rem] rounded-md shadow-lg z-50 ${TxClassTheme} border ${TxClassBorderColor}`,
  item: `px-4 py-2 text-sm cursor-pointer text-gray-700 dark:text-gray-200 ${TxClassHover}`,
  divider: `my-1 border-t border-gray-200 dark:border-gray-700`,
};
