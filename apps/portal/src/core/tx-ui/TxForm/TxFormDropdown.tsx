import { type ITxDropdownData, type ITxDropdownMultiProps, type ITxDropdownProps, TxDropdown, TxDropdownMulti } from '../TxDropdown';
import type { ITxFormFieldProps } from './TxForm.types';
import { TxFormField } from './TxFormField';

export const TxFormDropdown = <TData extends ITxDropdownData>(props: ITxDropdownProps<TData> & ITxFormFieldProps) => {
  const { caption, warning, error, ...rest } = props;

  return (
    <TxFormField data-tag="TxForm.Dropdown" caption={caption} warning={warning} error={error}>
      <TxDropdown {...rest} />
    </TxFormField>
  );
};

TxFormDropdown.displayName = 'TxForm.Dropdown';

export const TxFormDropdownMulti = <TData extends ITxDropdownData>(props: ITxFormFieldProps & ITxDropdownMultiProps<TData>) => {
  const { caption, warning, error, ...rest } = props;

  return (
    <TxFormField data-tag="TxForm.DropdownMulti" caption={caption} warning={warning} error={error}>
      <TxDropdownMulti {...rest} />
    </TxFormField>
  );
};

TxFormDropdownMulti.displayName = 'TxForm.DropdownMulti';
