import type { ChangeEvent, KeyboardEvent } from 'react';
import React from 'react';
import { TxInput, TxInputTheme, type DeepPartial } from '..'; // :contentReference[oaicite:0]{index=0}

export type TTxInputVale = string | number | readonly string[] | undefined;

export interface ITxInput extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'autoComplete'> {
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;

  onChangeText?: (value: string) => void;
  onChangeInt?: (value: number) => void;
  onChangeFloat?: (value: number) => void;
  onChangeNumber?: (value: number) => void;

  onSubmitText?: (value: string) => void;
  onSubmitNumber?: (value: number | undefined) => void;
  onBlurNumber?: (value: number | undefined) => void;

  onEnter?: (e: KeyboardEvent<HTMLInputElement>) => void;

  focus?: boolean;
  value?: TTxInputVale;
  autoComplete?: React.HTMLInputAutoCompleteAttribute;
  theme?: DeepPartial<typeof TxInputTheme>;
}

export interface ITxInputRef {
  setValue: (v: string) => void;
  getValue: () => string;
  focus: () => void;
}

export interface ITxSearchInputProps extends React.ComponentProps<typeof TxInput> {
  caption?: string;
  onClear?: (value: string) => void;
  onSubmitText?: (value: string) => void;
}

export interface ITxSearchInputRef extends ITxInputRef {
  clear: () => void;
  submit: () => void;
}
