import React from 'react';
import { TxFieldWrapperTheme, type DeepPartial } from '..';

export interface ITxField extends React.HTMLAttributes<HTMLDivElement> {
  caption?: string;
  warning?: string;
  error?: string;
  readOnly?: boolean;
  noWrapper?: boolean;
  theme?: DeepPartial<typeof TxFieldWrapperTheme>;
}
