import { forwardRef } from 'react';
import type { ITxInput, ITxInputRef } from '.';
import { TxInput } from '.';
import { TxField, type ITxField } from '..';

export interface ITxFieldInput extends ITxInput {
  caption?: string;
  warning?: string;
  error?: string;
}

export const TxFieldInput = forwardRef<ITxInputRef, ITxInput & ITxField>(({ caption, warning, error, className, theme, ...inputProps }, ref) => {
  return (
    <TxField caption={caption} warning={warning} error={error} className={className}>
      <TxInput ref={ref} {...inputProps} className="w-full" theme={theme} />
    </TxField>
  );
});

TxFieldInput.displayName = 'TxFieldInput';
