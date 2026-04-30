import { useCallback, useId, useState } from 'react';
import type { TTxInputValue } from '.';

interface UseInputParams {
  id?: string;
  name?: string;
  value?: TTxInputValue;
  defaultValue?: TTxInputValue;
}

export function useInput({ id, name, value, defaultValue }: UseInputParams) {
  const reactId = useId();
  const inputId = id ?? name ?? reactId;
  const isControlled = value != null;

  // uncontrolled 모드에서만 내부 값을 보관한다.
  const [innerValue, _innerValue] = useState<string>(() => String(defaultValue ?? value ?? ''));
  const currentValue = isControlled ? String(value) : innerValue;

  const setValue = useCallback(
    (nextValue: string) => {
      if (!isControlled) _innerValue(nextValue);
    },
    [isControlled],
  );

  return {
    currentValue,
    inputId,
    isControlled,
    setValue,
  };
}
