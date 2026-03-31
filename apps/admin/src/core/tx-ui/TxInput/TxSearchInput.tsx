import type { KeyboardEvent } from 'react';
import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { TxSearchInputTheme, type ITxInputRef, type ITxSearchInputProps, type ITxSearchInputRef } from '.';
import { IconClose, IconSearch, TxField, TxInput, cm, themeMerge } from '..';

export const TxSearchInput = forwardRef<ITxSearchInputRef, ITxSearchInputProps>(({ caption, theme, className, onClear, onSubmitText, onChangeText, value, ...props }, ref) => {
  const stableTheme = useMemo(() => themeMerge(TxSearchInputTheme, theme, 'override'), [theme]);
  const inputRef = useRef<ITxInputRef>(null);

  // ✅ ref API 위임 + 확장
  useImperativeHandle(
    ref,
    () => ({
      ...inputRef.current!,
      clear: () => {
        inputRef.current?.setValue('');
        onChangeText?.('');
        onClear?.('');
      },
      submit: () => {
        const v = inputRef.current?.getValue() ?? '';
        onSubmitText?.(v);
      },
    }),
    [onClear, onSubmitText, onChangeText],
  );

  function hdEnter(e: KeyboardEvent<HTMLInputElement>) {
    const v = e.currentTarget.value;
    onSubmitText?.(v);
    props.onEnter?.(e);
  }

  function hdClear() {
    inputRef.current?.setValue('');
    onChangeText?.('');
    onClear?.('');
  }

  const showClear = (value ?? '').toString().length > 0;

  return (
    <TxField caption={caption} className={cm(stableTheme.wrapper, stableTheme.focus, className)}>
      <IconSearch className={stableTheme.icon} onClick={() => onSubmitText?.(inputRef.current?.getValue() ?? '')} />

      <TxInput ref={inputRef} value={value} onChangeText={onChangeText} onEnter={hdEnter} className={'w-full'} {...props} theme={{ wrapper: '', focus: '' }} />

      {showClear && <IconClose className={stableTheme.icon} onClick={hdClear} />}
    </TxField>
  );
});

TxSearchInput.displayName = 'TxSearchInput';
