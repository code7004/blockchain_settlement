// src/pages/Access.tsx

import { RouteData } from '@/app/RouteData';
import { TxDropdownServer } from '@/components/TxDropdownServer';
import { useStateForObject } from '@/core/hooks';
import { post, type IApiResponse } from '@/core/network';
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

      const res = await post<IApiResponse<{ accessToken: string; expiresAt: number }>>('/api/admin/auth/login', form);

      // 1. redux 저장
      dispatch(authAction.signIn(res.data));

      // 3. refreshToken → HttpOnly Secure 쿠키에 서버에서 심어주도록 설계하는 게 베스트
      //    (여기 클라이언트 코드에서는 건드릴 필요 없음)
      //    만약 서버가 아직 쿠키 세팅 안 한다면 localStorage에 임시 저장 가능하지만 권장 ❌
      // localStorage.setItem("refreshToken", refreshToken);

      // 4. 페이지 이동
      // navigate('/dashboard');
      const state = location.state as { from?: Location } | null;
      const from: string = state?.from?.pathname || '/';
      void navigate(from, { replace: true });
    } catch (err) {
      const e = parseApiError(err);
      if (e.message.includes('username')) _eMessage({ username: e.message });
      else _eMessage({ password: e.message });
    }
  }
  // const handleAccess = networkWrapper(async () => {
  //   const res = await api.post<IApiResponse<{ message: string }>>('/auth/login', form);

  //   if (res.data.success == false) {
  //     alert(res.data.data.message);
  //     return _eMessage({ key: 'server', message: res.data.message });
  //   }

  //   // const { user, accessToken, refreshToken } = res.data.body;
  //   const { user, accessToken } = res.data.body;

  //   // ✅ 유저 정보만 store에 저장
  //   dispatch(signIn({ ...user, isSigned: true, autoLogin: config.autoLogin }));

  //   // ✅ 토큰 처리 (스토어 X)
  //   // 1) accessToken → Axios 기본 헤더 세팅
  //   api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

  //   // 2) refreshToken → HttpOnly Secure 쿠키에 서버에서 심어주도록 설계하는 게 베스트
  //   //    (여기 클라이언트 코드에서는 건드릴 필요 없음)
  //   //    만약 서버가 아직 쿠키 세팅 안 한다면 localStorage에 임시 저장 가능하지만 권장 ❌
  //   // localStorage.setItem("refreshToken", refreshToken);

  //   const state = location.state as { from?: Location } | null;
  //   const from: string = (state?.from?.pathname ?? '') || RouteData.Main.children.Dashboard.path;
  //   void navigate(from, { replace: true });
  // });

  // function hdAutoLogin() {
  //   dispatch(updateAuth({ autoLogin: !config.autoLogin }));
  // }

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
