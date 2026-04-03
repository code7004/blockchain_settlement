import { TxClassBorderColor, TxClassFocus, TxClassHover, TxClassTheme } from '../TxTheme';

// ------------------- Dropdown -------------------
export const TxDropdownTheme = {
  wrapper: `relative flex items-center px-3 h-10 w-[10em] rounded-md shadow-sm border ${TxClassBorderColor} ${TxClassTheme}  focus:outline-none `,
  focus: `${TxClassFocus}`,
  head: `flex flex-1 truncate items-center justify-between w-full cursor-pointer`,
  list: `absolute z-20 left-0 top-full w-full overflow-y-auto rounded-md shadow-lg ${TxClassTheme}`,
  divider: 'border-gray-300 dark:border-gray-600',
  item: {
    normal: `px-2 py-2 cursor-pointer text-sm ${TxClassTheme} ${TxClassHover}`,
    checked: 'bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white',
    focused: `bg-gray-100 dark:bg-gray-700 border-r-5 border-r-blue-500`,
  },
};
