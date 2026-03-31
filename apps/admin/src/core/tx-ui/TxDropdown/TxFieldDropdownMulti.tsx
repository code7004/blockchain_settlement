import { TxField, type ITxFieldDropdownMultiProps } from '..';
import { TxDropdownMulti } from './TxDropdownMulti';

export const TxFieldDropdownMulti = (props: ITxFieldDropdownMultiProps) => {
  const { caption, warning, error, ...rest } = props;

  return (
    <TxField data-tag="TxFieldDropdownMulti" caption={caption} warning={warning} error={error}>
      <TxDropdownMulti {...rest} />
    </TxField>
  );
};
