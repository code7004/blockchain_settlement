// 공통 표면 색상: 모든 tx-ui 컴포넌트는 이 토큰을 통해 light/dark 모드를 맞춘다.
export const TxClassBase = 'bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100';

// 기존 호환 토큰: 점진적 리팩토링 동안 기존 import를 유지한다.
export const TxClassTheme = TxClassBase;

export const TxClassBorder = 'border border-gray-300 dark:border-gray-600';

export const TxClassBorderColor = 'border-gray-300 dark:border-gray-600';

export const TxClassHover = 'hover:bg-gray-100 dark:hover:bg-gray-700';

export const TxClassFieldWrapperBase = 'h-10 px-3';

export const TxClassFocus = 'focus-within:ring-blue-500 focus-within:ring-2';

// ------------------- TxContextMenu -------------------
export const TxContextMenuTheme = {
  wrapper: `fixed z-50 flex flex-col w-60 overflow-hidden rounded-md shadow-lg ${TxClassBorder} ${TxClassBase}`,
  item: `px-4 py-2 text-sm font-bold cursor-pointer ${TxClassHover}`,
  divider: `my-1 border-t ${TxClassBorderColor}`,
};
