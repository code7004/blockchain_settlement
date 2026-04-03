// src/pages/Access.tsx

import { RouteData } from '@/app/RouteData';
import { TxDropdownServer } from '@/components/TxDropdownServer';
import { useStateForObject } from '@/core/hooks';
import { apipost, type IApiResponse } from '@/core/network';
import { parseApiError } from '@/core/network/api.utils';
import { TxButton, TxCapsLockCheck, TxCard, TxFieldInput, TxFlex, TxForm, TxHeader } from '@/core/tx-ui';
import { RexGroup } from '@/lib/regGroup';
import { authAction } from '@/store/auth';
import { useAppDispatch, useAuth } from '@/store/hooks';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface IForm {
  username: string;
  password: string;
}

export default function SignInPage() {
  const [form, _form] = useStateForObject<IForm>({ username: (import.meta.env.VITE_USERNAME as string) || '', password: (import.meta.env.VITE_PASSWORD as string) || '' });
  const [eMessage, _eMessage] = useState<Record<string, string | undefined>>();

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const auth = useAuth();

  const location = useLocation();
  const isMounted = useRef(false);

  const helper = (next: Partial<IForm>) => {
    // _eMessage(validate());
    _form(next);
  };

  useEffect(() => {
    if (isMounted?.current) return;

    if (auth.isSigned) void navigate(RouteData.DeveloperPage.children.Dashboard.path);
    isMounted.current = true;
  }, [auth, navigate]);

  const validateForm = () => {
    if (form.username == '') return { username: 'username을 입력하세요' };
    else if (RexGroup.username.reg.test(form.username) == false) return { username: RexGroup.username.message };
    else if (form.password == '') return { password: 'password를 입력하세요' };
    else if (RexGroup.password.reg.test(form.password) == false) return { password: RexGroup.password.message };
    return undefined;
  };

  async function handleLogin() {
    try {
      const valid = validateForm();
      if (valid) return _eMessage(valid);

      const res = await apipost<IApiResponse<{ accessToken: string; expiresAt: number }>>('/portal/auth/login', form);

      // 1. redux 저장
      dispatch(authAction.signIn(res.data));

      const state = location.state as { from?: Location } | null;
      const from: string = state?.from?.pathname || '/';
      void navigate(from, { replace: true });
    } catch (err) {
      const e = parseApiError(err);
      if (e.message.includes('username')) _eMessage({ username: e.message });
      else _eMessage({ password: e.message });
    }
  }

  return (
    <TxFlex className="flex flex-col justify-center items-center min-h-screen  text-black bg-white dark:bg-gray-900 dark:text-gray-100">
      <TxHeader className="text-7xl font-bold mb-6" children={import.meta.env.VITE_APP_NAME} />
      <TxCard caption={'🔒 개발자 접속'} className=" w-125 p-6">
        <TxForm className="gap-6">
          <TxForm.Flex className="flex gap-6 items-center">
            <TxForm.Label className="w-[6em] text-end" htmlFor="id" children={'서버선택'} />
            <TxDropdownServer className="flex-1" />
          </TxForm.Flex>

          <TxForm.Flex className="flex gap-6 items-center">
            <TxForm.Label className="w-[6em] text-end" htmlFor="id" children={'유저네임'} />
            <TxFieldInput className="flex-1" name="username" value={form.username} onChangeText={(username) => helper({ username })} autoComplete="off" error={eMessage?.username} />
          </TxForm.Flex>

          <TxForm.Flex className="flex gap-6 items-center">
            <TxForm.Label className="w-[6em] text-end" htmlFor="name" children="비밀번호" />
            <TxFieldInput className="flex-1" type="password" value={form.password} onChangeText={(password) => helper({ password })} error={eMessage?.password} autoComplete="off" />
          </TxForm.Flex>

          {/* <TxCheckBox className="w-[em]" label={`자동로그인(${config.autoLogin ? '24시간' : '1시간'})`} checked={config.autoLogin} onChange={hdAutoLogin} /> */}
          <TxForm.Flex>
            <TxButton type="submit" label={'sign in'} className="flex-1 w-full" onClick={handleLogin} />
          </TxForm.Flex>
        </TxForm>
        <TxCapsLockCheck className="m-2 p-0" preserveSpace={false} />
        <TxCard.Footer className="mt-2 text-xs text-gray-500 dark:text-gray-400">❗️ 본 시스템은 등록된 개발자만 접근 가능합니다.</TxCard.Footer>
      </TxCard>
    </TxFlex>
  );
}
