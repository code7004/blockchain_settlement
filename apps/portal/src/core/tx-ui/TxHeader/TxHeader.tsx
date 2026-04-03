// TxHeader.tsx
import React, { useMemo } from 'react';
import { TxHeaderTheme } from '.';
import { cm, themeMerge } from '..';

export interface ITxHeader extends React.HTMLAttributes<HTMLDivElement> {
  theme?: Partial<typeof TxHeaderTheme>;
}

export const TxHeader = ({ className, children, theme, ...props }: ITxHeader) => {
  const stableTheme = useMemo(() => themeMerge(TxHeaderTheme, theme, 'override'), [theme]);
  return (
    <div data-tag="TxHeader" className={cm(stableTheme, className)} {...props}>
      {children}
    </div>
  );
};

TxHeader.displayName = 'TxHeader';
