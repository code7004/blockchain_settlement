// 1. 강력한 글로벌 Theme
export const TxClassTheme = 'bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100';

// 2. 권장 기본 유틸
export const TxClassBorderColor = 'border-gray-300 dark:border-gray-600';

export const TxClassHover = 'hover:bg-gray-100 dark:hover:bg-gray-700';

// 공통 규격 (FieldWrapper와 Button이 공유)
export const TxClassFieldWrapperBase = `h-10 px-3`;

export const TxClassFocus = `focus-within:ring-blue-500 focus-within:ring-2`;

// ------------------- TxContextMenu -------------------
export const TxContextMenuTheme = {
  wrapper: `fixed z-50 flex flex-col w-60 overflow-hidden rounded-md shadow-lg border ${TxClassBorderColor} ${TxClassTheme}`,
  item: `px-4 py-2 text-sm font-bold cursor-pointer ${TxClassHover}`,
  divider: `my-1 border-t ${TxClassBorderColor}`,
};
