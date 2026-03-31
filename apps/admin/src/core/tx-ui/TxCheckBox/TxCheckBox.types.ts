import type { TxCheckBoxTheme } from '.';
import type { DeepPartial } from '..';

export interface ITxCheckBoxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  theme?: DeepPartial<typeof TxCheckBoxTheme>;
  onChangeBool?: (checked: boolean) => void;
}
