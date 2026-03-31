import type { TxFormTheme } from '.';
import type { DeepPartial } from '..';

export interface ITxFormCtx {
  labelWidth?: string;
}

export interface ITxForm extends React.FormHTMLAttributes<HTMLFormElement> {
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  labelWidth?: string;
  theme?: Partial<typeof TxFormTheme>;
}

export type ITxFormLabelProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
  theme?: DeepPartial<typeof TxFormTheme>;
};

export type ITxFormFlexProps = React.HTMLAttributes<HTMLDivElement> & {
  theme?: DeepPartial<typeof TxFormTheme>;
};
