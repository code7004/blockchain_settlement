import type { ITxDropdownData } from '.';
import { TxField, type ITxFieldDropdownMultiProps } from '..';
import { TxDropdownMulti } from './TxDropdownMulti';

export const TxFieldDropdownMulti = <TData extends ITxDropdownData>(props: ITxFieldDropdownMultiProps<TData>) => {
  const { caption, warning, error, ...rest } = props;

  return (
    <TxField data-tag="TxFieldDropdownMulti" caption={caption} warning={warning} error={error}>
      <TxDropdownMulti {...rest} />
    </TxField>
  );
};
