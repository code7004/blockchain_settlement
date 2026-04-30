import type React from 'react';
import type { DeepPartial, TxFormTheme } from '..';

export interface ITxFormCtx {
  labelWidth?: string;
}

export interface ITxForm extends React.FormHTMLAttributes<HTMLFormElement> {
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  labelWidth?: string;
  theme?: DeepPartial<typeof TxFormTheme>;
}

export type ITxFormLabelProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
  theme?: DeepPartial<typeof TxFormTheme>;
};

export type ITxFormFlexProps = React.HTMLAttributes<HTMLDivElement> & {
  theme?: DeepPartial<typeof TxFormTheme>;
};

export interface ITxFormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  caption?: React.ReactNode;
  warning?: React.ReactNode;
  error?: React.ReactNode;
  theme?: DeepPartial<typeof TxFormTheme.field>;
}
