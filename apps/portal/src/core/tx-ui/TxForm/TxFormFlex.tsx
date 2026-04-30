import { memo, useMemo } from 'react';
import { cm, themeMerge } from '../tx-ui.utils';
import { TxFormTheme } from './TxForm.theme';
import type { ITxFormFlexProps } from './TxForm.types';

export const TxFormFlex = memo(({ className, theme, ...props }: ITxFormFlexProps) => {
  const stableTheme = useMemo(() => themeMerge(TxFormTheme, theme, 'override'), [theme]);

  return <div data-tag="TxForm.Flex" className={cm(stableTheme.flex, className)} {...props} />;
});

TxFormFlex.displayName = 'TxForm.Flex';
