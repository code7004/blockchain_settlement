import { TxButton, TxDropMenu } from '@/core/tx-ui';
import { ChangePasswordModal } from '@/domains/member/components/ChangePasswordModal';
import type { IState } from '@/store';
import { authAction } from '@/store/auth';
import { configAction } from '@/store/config';
import { useAppDispatch, useAuth } from '@/store/hooks';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
const env = import.meta.env;

function getRemainTime(expiresAt: number | undefined) {
  if (!expiresAt) return 'Expired';

  const diff = expiresAt - Date.now();

  if (diff <= 0) return 'Expired';

  const sec = Math.floor(diff / 1000);
  const m = Math.floor(sec / 60);
  const s = sec % 60;

  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function Topbar() {
  const auth = useAuth();
  const config = useSelector((state: IState) => state.config);
  const isDark = config.darkMode;
  const dispatch = useAppDispatch();

  const [remain, _remain] = useState('');
  const [isPassPop, _isPassPop] = useState(false);

  useEffect(() => {
    const update = () => {
      _remain(getRemainTime(auth.expiresAt));
    };

    update(); // 최초 1회

    const timer = setInterval(update, 1000);

    return () => clearInterval(timer);
  }, [auth.expiresAt]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, [isDark]);

  useEffect(() => {
    if (!auth.expiresAt) return;

    const timeout = auth.expiresAt - Date.now();

    if (timeout <= 0) {
      dispatch(authAction.signOut());
      return;
    }

    const timer = setTimeout(() => {
      alert('인증 유효시간이 만료 되었습니다. 다시 로그인 해주세요.');
      dispatch(authAction.signOut());
    }, timeout);

    return () => clearTimeout(timer);
  }, [auth.expiresAt, dispatch]);

  const toggleDark = () => {
    const newVal = !isDark;
    document.documentElement.classList.toggle('dark', newVal);
    dispatch(configAction.darkMode(newVal));
  };

  function hdClickSign() {
    if (confirm('로그아웃 하시겠습니까?')) {
      dispatch(authAction.signOut());
    }
  }

  return (
    <div className="h-14 bg-white dark:bg-gray-800 shadow flex items-center justify-between px-6">
      <div className="text-sm text-gray-500 dark:text-gray-400">{`Environment: { ServerType:${config.server}, DEBUG: ${env.VITE_API_DEBUG}, MODE: ${env.MODE}, PROD: ${env.PROD}}`}</div>

      <div className="flex items-center gap-4">
        <span className="text-xs text-gray-400">Exp: {remain}</span>

        <TxDropMenu label={`👤 ${auth.username}`}>
          <TxDropMenu.Item className="text-center" onClick={() => _isPassPop(true)} children="비밀번호변경" />
          <TxDropMenu.Divider />
          <TxDropMenu.Item className="text-center" onClick={hdClickSign} children="로그아웃" />
        </TxDropMenu>

        <TxButton onClick={toggleDark} variant="secondary" className="py-1! h-full">
          {isDark ? '🌙 Dark' : '☀️ Light'}
        </TxButton>
      </div>
      <ChangePasswordModal auth={auth} visible={isPassPop} onExit={() => _isPassPop(false)} />
    </div>
  );
}
