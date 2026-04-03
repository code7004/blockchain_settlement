// txbutton.theme.ts

import { TxClassBorderColor, TxClassFocus, TxClassHover, TxClassTheme } from '../TxTheme';

// ------------------- Button -------------------
export const TxButtonTheme = {
  base: ` ${TxClassBorderColor} ${TxClassTheme} p-2 font-medium rounded-md shadow-sm cursor-pointer transition-colors justify-center 
         disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`,
  focus: `${TxClassFocus}`,
  // === Semantic Variants ===
  variants: {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600',
    danger: 'bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700',
    ghost: `bg-transparent ${TxClassHover}`,
    text: `bg-transparent underline cursor-pointer ${TxClassHover}`,
  },

  // === Color Palette Variants ===
  colors: {
    // Blue family
    blue: 'bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700',
    indigo: 'bg-indigo-500 text-white hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700',
    cyan: 'bg-cyan-500 text-white hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-700',
    teal: 'bg-teal-500 text-white hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700',

    // Green family
    green: 'bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700',
    lime: 'bg-lime-500 text-black hover:bg-lime-600 dark:bg-lime-600 dark:hover:bg-lime-700',
    emerald: 'bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700',

    // Warm colors
    yellow: 'bg-yellow-500 text-black hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700',
    amber: 'bg-amber-500 text-black hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700',
    orange: 'bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700',
    red: 'bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700',
    rose: 'bg-rose-500 text-white hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700',

    // Purple / Pink
    purple: 'bg-purple-500 text-white hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700',
    fuchsia: 'bg-fuchsia-500 text-white hover:bg-fuchsia-600 dark:bg-fuchsia-600 dark:hover:bg-fuchsia-700',
    pink: 'bg-pink-500 text-white hover:bg-pink-600 dark:bg-pink-600 dark:hover:bg-pink-700',

    // Neutral / Gray scale
    slate: 'bg-slate-500 text-white hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-700',
    gray: 'bg-gray-500 text-white hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700',
    zinc: 'bg-zinc-500 text-white hover:bg-zinc-600 dark:bg-zinc-600 dark:hover:bg-zinc-700',
    neutral: 'bg-neutral-500 text-white hover:bg-neutral-600 dark:bg-neutral-600 dark:hover:bg-neutral-700',
    stone: 'bg-stone-500 text-white hover:bg-stone-600 dark:bg-stone-600 dark:hover:bg-stone-700',
  },
};
