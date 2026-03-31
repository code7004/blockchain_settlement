import type { ChangeEvent, KeyboardEvent } from 'react';
import React, { forwardRef, useId, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { TxInputTheme, cm, themeMerge, type ITxInput, type ITxInputRef } from '..';

export const TxInput = forwardRef<ITxInputRef, ITxInput>(
  ({ readOnly = false, id, name, theme, className, focus, autoComplete, value, defaultValue, onSubmitText, onSubmitNumber, onBlurNumber, onChangeText, onChangeInt, onChangeFloat, onChangeNumber, ...props }, ref) => {
    const stableTheme = useMemo(() => themeMerge(TxInputTheme, theme, 'override'), [theme]);
    const inputRef = useRef<HTMLInputElement>(null);

    // ✅ uncontrolled 상태 (defaultValue 기반)
    const [innerValue, _innerValue] = useState<string>(() => String(defaultValue ?? value ?? ''));

    // ✅ controlled 우선
    const isControlled = value != null;
    const xValue = isControlled ? String(value) : innerValue;

    // ✅ id 안정화 (impure 제거)
    const reactId = useId();
    const inputId = id ?? name ?? reactId;

    const parseNumber = (val: string): number | undefined => {
      if (val.trim() === '') return undefined;
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    };

    // ✅ ref API
    useImperativeHandle(
      ref,
      () => ({
        setValue: (v: string) => {
          if (!isControlled) _innerValue(v);
        },
        getValue: () => xValue,
        focus: () => inputRef.current?.focus(),
      }),
      [xValue, isControlled],
    );

    // ✅ focus 처리 (effect 허용: 외부 시스템 sync)
    React.useEffect(() => {
      if (focus) inputRef.current?.focus();
    }, [focus]);

    const hdChange = (evt: ChangeEvent<HTMLInputElement>) => {
      props.onChange?.(evt);

      const text = evt.target.value;

      // ✅ uncontrolled일 때만 내부 상태 사용
      if (!isControlled) {
        _innerValue(text);
      }

      onChangeText?.(text);

      const num = parseNumber(text);
      if (num != null) {
        onChangeNumber?.(num);
        onChangeInt?.(Math.trunc(num));
        onChangeFloat?.(num);
      }
    };

    const hdKeyDown = (evt: KeyboardEvent<HTMLInputElement>) => {
      if (evt.key !== 'Enter') return;

      props.onEnter?.(evt);

      const val = evt.currentTarget.value;

      onSubmitText?.(val);
      onSubmitNumber?.(parseNumber(val));
    };

    const hdBlur = (evt: React.FocusEvent<HTMLInputElement>) => {
      props.onBlur?.(evt);

      const val = evt.currentTarget.value;
      onBlurNumber?.(parseNumber(val));
    };

    return (
      <div data-tag="TxInput" className={cm(stableTheme.wrapper, stableTheme.focus, readOnly && stableTheme.readOnly, className)}>
        <input
          {...props}
          id={inputId}
          name={name}
          ref={inputRef}
          readOnly={readOnly}
          autoComplete={autoComplete}
          className={cm(stableTheme.input, props.type == 'number' && stableTheme.number)}
          value={xValue}
          onChange={hdChange}
          onKeyDown={hdKeyDown}
          onBlur={hdBlur}
        />
      </div>
    );
  },
);

TxInput.displayName = 'TxInput';
