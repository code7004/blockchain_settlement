// ------------------- TxCoolTable -------------------
export const TxCoolTableTheme = {
  table: `w-full text-gray-700 dark:text-gray-300 border-collapse`,
  caption: `font-bold text-sm text-gray-400 dark:text-gray-600 whitespace-pre-wrap`,
  thead: {
    tr: `bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200`,
    th: `py-2 pxr-2 align-middle border-b-2 bg-gray-200 dark:bg-gray-700`,
  },
  tbody: {
    tr: `border-b text-gray-500 dark:text-gray-400`,
    td: `py-1 px-2 align-middle overflow-auto border-b 
      whitespace-nowrap overflow-hidden
      bg-[var(--txcool-bg,theme(colors.white))] dark:bg-[var(--txcool-bg,theme(colors.gray.800))] scrollbar-thin`,
  },
  state: {
    hover: `hover:[--txcool-bg:theme(colors.gray.100)] dark:hover:[--txcool-bg:theme(colors.gray.700)]`,
    checked: `[--txcool-bg:theme(colors.blue.100)] `,
    editable: `whitespace-nowrap overflow-x-auto cursor-text outline-none focus:bg-white dark:focus:bg-gray-800 focus:text-black dark:focus:text-white focus:shadow-[0_0_0_2px_rgba(59,130,246,0.8)]`,
    fixable: `bg-gray-200 dark:bg-gray-600 text-black dark:text-gray-100`,
  },
  nonData: `font-bold text-sm text-gray-400 dark:text-gray-600 whitespace-pre-wrap text-center`,
};

export const TxCoolTablePagenationTheme = {
  wrapper: 'w-full flex justify-center mt-2',
  group: 'flex flex-wrap gap-2',
  button: {
    base: `py-2 text-center text-sm font-medium w-[3em] transition-all duration-200 border border-gray-300 dark:border-gray-600 rounded hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed border-2`,
    active: 'bg-blue-500 text-white border-blue-500 hover:bg-blue-700 shadow-md',
    disabled: 'bg-gray-100 text-gray-400 border-gray-200 dark:bg-gray-600 dark:text-gray-800 dark:border-gray-400',
  },
};
