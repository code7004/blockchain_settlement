import React, { useEffect, useMemo, useState, type SVGProps } from 'react';
import { TxCheckBoxTheme, type ITxCheckBoxProps } from '.';
import { cm, themeMerge } from '..';

export const TxCheckBox: React.FC<ITxCheckBoxProps> = ({ label, theme, children, value = false, onChangeBool, className, variant = 'checkbox' }) => {
  const stableTheme = useMemo(() => themeMerge(TxCheckBoxTheme, theme, 'override'), [theme]);
  const [checked, _checked] = useState(value);

  useEffect(() => {
    _checked(value);
  }, [value]);

  function hdClick(event: React.MouseEvent<HTMLDivElement, MouseEvent>): void {
    event.stopPropagation();
    _checked(!checked);
    onChangeBool?.(!checked);
  }

  return (
    <div data-tag="TxCheckBox" className={cm(stableTheme.base, className)} onClick={hdClick}>
      {variant === 'checkbox' && <span className={cm(stableTheme.checkbox.box, checked && stableTheme.checkbox.checked)}>{checked && <BaselineCheck className={TxCheckBoxTheme.checkbox.icon} />}</span>}

      {variant === 'toggle' && (
        <span className={cm(stableTheme.toggle.wrapper, checked && stableTheme.toggle.checked)}>
          <span className={cm(stableTheme.toggle.thumb, checked && stableTheme.toggle.thumbChecked)} />
        </span>
      )}

      {label && <span className={stableTheme.label}>{label}</span>}

      {children}
    </div>
  );
};

TxCheckBox.displayName = 'TxCheckBox';

function BaselineCheck(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" {...props}>
      <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19L21 7l-1.41-1.41z"></path>
    </svg>
  );
}
