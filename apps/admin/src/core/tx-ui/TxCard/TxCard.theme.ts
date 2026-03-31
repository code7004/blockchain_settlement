import { TxClassBorderColor, TxClassTheme } from '..';

// ------------------- Card -------------------
export const TxCardTheme = {
  base: `relative flex flex-col rounded-md shadow-sm p-2 border ${TxClassBorderColor} ${TxClassTheme}`,
  caption: `absolute -top-4 left-1 px-1 z-[1] whitespace-nowrap font-bold overflow-hidden ${TxClassTheme} !bg-transparent`,
  floating: `absolute z-10 space-x-2 text-xs text-gray-500 top-2 right-2 dark:text-gray-400`,
  floatingLink: `hover:text-gray-700 dark:hover:text-white`,
  floatingButton: `cursor-pointer hover:text-gray-700 dark:hover:text-white`,
  content: ``,
  contentLoading: `relative overflow-hidden text-transparent select-none p-1 w-full flex-1`,
  loadingBG: `absolute inset-0 animate-pulse bg-gradient-to-r 
              from-gray-200 via-gray-100 to-gray-200 
              dark:from-gray-700 dark:via-gray-800 dark:to-gray-700`,
  header: `flex gap-2 mb-2`,
  footer: `flex mt-2 pt-2 border-t ${TxClassBorderColor}`,
};
