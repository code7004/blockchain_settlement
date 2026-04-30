import type { ChangeEvent, KeyboardEvent } from 'react';
import React, { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { TxInputTheme, cm, parseTxInputNumber, themeMerge, useInput, type ITxInput, type ITxInputRef } from '..';

const TxInputComponent = forwardRef<ITxInputRef, ITxInput>(
  ({ readOnly = false, id, name, theme, className, focus, autoComplete, value, defaultValue, onSubmitText, onSubmitNumber, onBlurNumber, onChangeText, onChangeInt, onChangeFloat, onChangeNumber, ...props }, ref) => {
    // 테마 객체 병합 비용을 줄이기 위해 입력 테마를 memoized 값으로 유지한다.
    const stableTheme = useMemo(() => themeMerge(TxInputTheme, theme, 'override'), [theme]);
    const inputRef = useRef<HTMLInputElement>(null);
    const { currentValue, inputId, isControlled, setValue } = useInput({ id, name, value, defaultValue });

    useImperativeHandle(
      ref,
      () => ({
        setValue,
        getValue: () => currentValue,
        focus: () => inputRef.current?.focus(),
        select: () => inputRef.current?.select(),
      }),
      [currentValue, setValue],
    );

    useEffect(() => {
      if (focus) inputRef.current?.focus();
    }, [focus]);

    const hdChange = useCallback(
      (evt: ChangeEvent<HTMLInputElement>) => {
        props.onChange?.(evt);

        const text = evt.target.value;
        if (!isControlled) setValue(text);

        onChangeText?.(text);

        const num = parseTxInputNumber(text);
        if (num != null) {
          onChangeNumber?.(num);
          onChangeInt?.(Math.trunc(num));
          onChangeFloat?.(num);
        }
      },
      [isControlled, onChangeFloat, onChangeInt, onChangeNumber, onChangeText, props, setValue],
    );

    const hdKeyDown = useCallback(
      (evt: KeyboardEvent<HTMLInputElement>) => {
        if (evt.key !== 'Enter') return;

        props.onEnter?.(evt);

        const nextValue = evt.currentTarget.value;
        onSubmitText?.(nextValue);
        onSubmitNumber?.(parseTxInputNumber(nextValue));
      },
      [onSubmitNumber, onSubmitText, props],
    );

    const hdBlur = useCallback(
      (evt: React.FocusEvent<HTMLInputElement>) => {
        props.onBlur?.(evt);

        onBlurNumber?.(parseTxInputNumber(evt.currentTarget.value));
      },
      [onBlurNumber, props],
    );

    return (
      <div data-tag="TxInput" className={cm(stableTheme.wrapper, stableTheme.focus, readOnly && stableTheme.readOnly, className)}>
        <input
          {...props}
          id={inputId}
          name={name}
          ref={inputRef}
          readOnly={readOnly}
          autoComplete={autoComplete}
          className={cm(stableTheme.input, props.type === 'number' && stableTheme.number)}
          value={currentValue}
          onChange={hdChange}
          onKeyDown={hdKeyDown}
          onBlur={hdBlur}
        />
      </div>
    );
  },
);

TxInputComponent.displayName = 'TxInput';

// 입력 컴포넌트는 테이블 필터/폼에서 반복 렌더링되므로 props 동일 시 재렌더를 줄인다.
export const TxInput = memo(TxInputComponent);
