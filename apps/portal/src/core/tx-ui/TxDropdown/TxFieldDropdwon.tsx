import { TxField, type ITxDropdownData, type ITxFieldDropdownProps } from '..';
import { TxDropdown } from './TxDropdown';

export const TxFieldDropdown = <TData extends ITxDropdownData>(props: ITxFieldDropdownProps<TData>) => {
  const { caption, warning, error, ...rest } = props;

  return (
    <TxField data-tag="TxFieldDropdown" caption={caption} warning={warning} error={error}>
      <TxDropdown {...rest} />
    </TxField>
  );
};
