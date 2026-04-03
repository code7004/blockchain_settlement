// TxCheckBoxTheme.ts
export const TxCheckBoxTheme = {
  base: 'inline-flex items-center gap-2 cursor-pointer select-none',

  checkbox: {
    box: 'w-5 h-5 flex items-center justify-center border rounded transition-all',
    checked: 'bg-blue-500 border-blue-500',
    icon: 'w-4 h-4 text-white',
  },

  toggle: {
    wrapper: 'w-9 h-5 rounded-full relative transition-colors bg-gray-200',
    checked: 'bg-blue-500',
    thumb: 'w-4 h-4 rounded-full absolute top-[2px] left-[2px] transition-all bg-gray-400',
    thumbChecked: 'translate-x-4 bg-white',
  },

  label: 'text-sm',
};
