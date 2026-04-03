import { TxClassBorderColor, TxClassFocus, TxClassTheme } from '../TxTheme';

// ------------------- Input -------------------
export const TxInputTheme = {
  wrapper: `w-[10em] h-10 flex items-center rounded-md shadow-sm border ${TxClassBorderColor} ${TxClassTheme} `,
  focus: `${TxClassFocus}`,
  input: `w-full border-0 outline-0 px-3 bg-transparent text-base placeholder-gray-400 focus:outline-none focus:ring-0 disabled:opacity-50`,
  readOnly: `opacity-50`,
  number: `text-end pr-4`,
};

export const TxSearchInputTheme = {
  wrapper: `flex px-3 ${TxInputTheme.wrapper}`,
  focus: `${TxClassFocus}`,
  icon: 'w-5 h-5 text-gray-400 cursor-pointer',
};
