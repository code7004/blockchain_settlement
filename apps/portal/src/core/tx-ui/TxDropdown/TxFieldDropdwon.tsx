import { TxField, type ITxFieldDropdownProps } from '..';
import { TxDropdown } from './TxDropdown';

export const TxFieldDropdown = (props: ITxFieldDropdownProps) => {
  const { caption, warning, error, ...rest } = props;

  return (
    <TxField data-tag="TxFieldDropdown" caption={caption} warning={warning} error={error}>
      <TxDropdown {...rest} />
    </TxField>
  );
};
