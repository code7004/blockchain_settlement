import React, { useMemo } from 'react';
import { TxCheckBoxTheme, type ITxCheckBoxProps } from '.';
import { cm, themeMerge } from '..';

export const TxCheckBox: React.FC<ITxCheckBoxProps> = ({ label, className, theme, checked, onChangeBool, ...props }) => {
  const stableTheme = useMemo(() => themeMerge(TxCheckBoxTheme, theme, 'override'), [theme]);

  function hdChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChangeBool?.(e.target.checked);
    props.onChange?.(e);
  }

  return (
    <label data-tag="TxCheckBox" className={cm(stableTheme.wrapper, className)}>
      <input type="checkbox" className={stableTheme.input} checked={checked} onChange={hdChange} {...props} />
      {label && <span className={stableTheme.label}>{label}</span>}
    </label>
  );
};

TxCheckBox.displayName = 'TxCheckBox';
