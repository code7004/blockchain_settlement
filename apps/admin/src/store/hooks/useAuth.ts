import { useSelector } from 'react-redux';
import type { IState } from '..';
import type { IStateAuth } from '../auth';
/**
 *
 * @example
 * import { useAuth } from "@/core/hooks";
 * const auth = useAuth();
 *
 * import { useAuth, useDispatch } from "@/core/hooks";
 * import { signIn } from "@/core/store/auth";
 *
 * const auth = useAuth();
 * const dispatch = useDispatch();
 *
 * dispatch(signIn());
 */
export function useAuth(): IStateAuth {
  const auth = useSelector<IState>((state) => state.auth) as IStateAuth;

  return auth;
}
