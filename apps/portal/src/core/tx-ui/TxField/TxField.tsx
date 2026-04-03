import { forwardRef, useMemo } from 'react';
import { TxFieldWrapperTheme, cm, themeMerge, type ITxField } from '..';

/**
 * TxFieldWrapper
 * - Input, Dropdown 같은 입력 컨트롤을 감싸는 보더 박스
 * - caption은 absolute 스타일만 지원
 */
export const TxField = forwardRef<HTMLDivElement, ITxField>(({ caption, theme, warning, error, noWrapper, className, children, ...props }, ref) => {
  const stableTheme = useMemo(() => themeMerge(TxFieldWrapperTheme, theme, 'override'), [theme]);

  if (noWrapper) return <>{children}</>;

  return (
    <div data-tag="TxField" ref={ref} className={cm(stableTheme.container, className)} {...props}>
      {caption && <div className={stableTheme.absoluteCaption}>{caption}</div>}
      {children}
      {warning && <div className={stableTheme.absoluteWarning}>⚠️{warning}</div>}
      {error && <div className={stableTheme.absoluteError}>⛔{error}</div>}
    </div>
  );
});

TxField.displayName = 'TxFieldWrapper';
