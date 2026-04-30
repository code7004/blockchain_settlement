import { forwardRef } from 'react';
import { TxInput, TxSearchInput, type ITxInput, type ITxInputRef, type ITxSearchInputProps, type ITxSearchInputRef } from '../TxInput';
import { TxFormField } from './TxFormField';
import type { ITxFormFieldProps } from './TxForm.types';

export const TxFormInput = forwardRef<ITxInputRef, ITxFormFieldProps & ITxInput>(({ caption, warning, error, className, theme, ...inputProps }, ref) => {
  return (
    <TxFormField data-tag="TxForm.Input" caption={caption} warning={warning} error={error} className={className}>
      <TxInput ref={ref} {...inputProps} className="w-full" theme={theme} />
    </TxFormField>
  );
});

TxFormInput.displayName = 'TxForm.Input';

export const TxFormSearchInput = forwardRef<ITxSearchInputRef, ITxFormFieldProps & ITxSearchInputProps>(({ caption, warning, error, className, theme, ...inputProps }, ref) => {
  return (
    <TxFormField data-tag="TxForm.Input" caption={caption} warning={warning} error={error} className={className}>
      <TxSearchInput ref={ref} {...inputProps} className="w-full" theme={theme} />
    </TxFormField>
  );
});

TxFormSearchInput.displayName = 'TxForm.SearchInput';
