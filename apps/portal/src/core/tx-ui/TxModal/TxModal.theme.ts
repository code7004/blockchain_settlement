import { TxClassBorderColor, TxClassTheme } from '..';

export const TxModalTheme = {
  overlay: 'absolute inset-0 bg-black/40',
  container: `relative rounded-2xl shadow-lg overflow-hidden mx-2 sm:mx-4 ${TxClassTheme} border-2 ${TxClassBorderColor}`,
  header: `flex p-2 font-bold text-center border-b ${TxClassTheme} ${TxClassBorderColor}`,
  body: `flex flex-col items-center justify-center p-6 ${TxClassTheme}`,
};
