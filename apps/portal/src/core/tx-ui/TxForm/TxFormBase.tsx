import React, { createContext, memo, useCallback, useContext, useMemo } from 'react';
import { TxFormTheme, type ITxForm, type ITxFormCtx, type ITxFormLabelProps } from '.';
import { cm, themeMerge } from '..';

const FormCtx = createContext<ITxFormCtx>({});

export const TxFormBase = ({ className, theme, children, onSubmit, onReset, labelWidth, ...props }: ITxForm) => {
  const stableTheme = useMemo(() => themeMerge(TxFormTheme, theme, 'override'), [theme]);
  const ctxValue = useMemo(() => ({ labelWidth }), [labelWidth]);

  const hdSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSubmit?.(e);
    },
    [onSubmit],
  );

  return (
    <FormCtx.Provider value={ctxValue}>
      <form data-tag="TxForm" className={cm(stableTheme.wrapper, className)} onSubmit={hdSubmit} onReset={onReset} {...props}>
        {children}
      </form>
    </FormCtx.Provider>
  );
};

export const TxFormLabel = memo(({ className, theme, ...props }: ITxFormLabelProps) => {
  const { labelWidth } = useContext(FormCtx);
  const stableTheme = useMemo(() => themeMerge(TxFormTheme, theme, 'override'), [theme]);

  return <label data-tag="TxForm.Label" className={cm(stableTheme.label, labelWidth, className)} {...props} />;
});

TxFormLabel.displayName = 'TxForm.Label';
