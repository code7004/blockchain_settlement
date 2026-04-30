import { useMemo } from 'react';
import { TxFormTheme, type ITxFormFieldProps } from '.';
import { themeMerge } from '..';

export function useFormField(theme: ITxFormFieldProps['theme']) {
  // 필드 스타일 병합은 렌더마다 반복될 수 있어 hook에서 안정화한다.
  return useMemo(() => themeMerge(TxFormTheme.field, theme, 'override'), [theme]);
}
