import type { TxCheckBoxTheme } from '.';
import type { DeepPartial } from '..';

export interface ITxCheckBoxProps {
  label?: string;
  theme?: DeepPartial<typeof TxCheckBoxTheme>;
  value?: boolean;
  onChangeBool?: (checked: boolean) => void;
  className?: string;
  variant?: 'checkbox' | 'toggle';
  children?: React.ReactNode;
  borderColor?: string;
  fillColor?: string;
  cursorColor?: string;
}
