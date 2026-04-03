import { useSelector } from 'react-redux';
import type { IState } from '..';
import type { IStateConfig } from '../config';

export function useConfig(): IStateConfig {
  const store = useSelector<IState>((state) => state.config) as IStateConfig;

  return store;
}
