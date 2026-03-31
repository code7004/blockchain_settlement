import { checkForm, networkWrapper } from '@/core/extensions';
import { useStateForObject } from '@/core/hooks';
import { parseApiError } from '@/core/network';
import { TxButton, TxFlex, TxForm, TxInput, TxModal, type ITxInputRef, type ITxModalProps } from '@/core/tx-ui';
import { RexGroup } from '@/lib/regGroup';
import type { IStateAuth } from '@/store/auth';
import { isEmpty } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { patchChangePwd, postVerifyPwd } from '../member.api';

interface ITxModalUserForm extends Omit<ITxModalProps, 'children'> {
  auth: IStateAuth;
}

export const ChangePasswordModal = ({ auth, ...props }: ITxModalUserForm) => {
  const [step, _step] = useState(0);
  const [verifyForm, _verifyForm] = useStateForObject<{ password1?: string; password2?: string }>({ password1: undefined, password2: undefined });
  const [changeForm, _changeForm] = useStateForObject<typeof verifyForm>({ password1: undefined, password2: undefined });
  const [eMessage, _eMessage] = useState<Record<string, string>>();

  const nextREf = useRef<ITxInputRef>(null);

  useEffect(() => {
    if (step === 1) {
      nextREf.current?.focus();
    }
  }, [step]);

  const hpChangeForm = (next: typeof changeForm) => {
    _changeForm({ ...next });
    const c = checkForm(next, RexGroup);
    _eMessage(c);
  };

  const hdCheckVerifyForm = async () => {
    if (isEmpty(verifyForm.password1)) return _eMessage({ message: '비밀번호를 입력하세요' });
    if (isEmpty(verifyForm.password2)) return _eMessage({ message: '비밀번호확인을 입력하세요' });

    if (!auth.id || !verifyForm.password1 || !verifyForm.password2) return;

    if (verifyForm.password1 != verifyForm.password2) return _eMessage({ message: '비밀번호와 확인이 일치 하지 않습니다.' });

    try {
      await postVerifyPwd({ id: auth.id, password: verifyForm.password1 });
      _step(1);
      _eMessage(undefined);
    } catch (err) {
      const e = parseApiError(err);
      _eMessage({ message: e.message });
    }
  };

  const hdModify = networkWrapper(async () => {
    if (isEmpty(changeForm.password1)) return _eMessage({ message: '변경 비밀번호를 입력하세요' });
    if (isEmpty(changeForm.password2)) return _eMessage({ message: '변경 비밀번호확인을 입력하세요' });

    if (!auth.id || !changeForm.password2 || !verifyForm.password2) return;
    if (changeForm.password1 != changeForm.password2) return _eMessage({ message: '비밀번호와 확인이 일치 하지 않습니다.' });
    if (changeForm.password2 == verifyForm.password2) return alert('이전 비밀번호와 동일 합니다.');

    const temp = checkForm(changeForm, RexGroup);
    _eMessage(temp);
    if (temp && Object.values(temp)?.length > 0) return alert(`${Object.values(temp)[0]}`);

    try {
      await patchChangePwd({ id: auth.id, oldPassword: verifyForm.password2, newPassword: changeForm.password2 });
      _step(1);
      _eMessage(undefined);
      alert('비밀변호가 변경되었습니다.');
      hdExit();
    } catch (err) {
      const e = parseApiError(err);
      _eMessage({ message: e.message });
    }
  });

  function hdExit() {
    props.onExit?.();
    _verifyForm({ password1: undefined, password2: undefined });
    _changeForm({ password1: undefined, password2: undefined });
    _step(0);
    _eMessage(undefined);
  }

  return (
    <TxModal {...props} title={(step == 0 ? '현재 ' : '변경') + '비밀번호 입력'} onExit={hdExit}>
      {step == 0 ? (
        <TxForm autoComplete="off" className="p-6 w-100">
          <TxInput type="text" name="username" className="w-px h-px" autoComplete="username" />
          <TxInput type="password" autoComplete="new-password" className="w-full hidden" />
          <TxForm.Label>현재 비밀번호</TxForm.Label>
          <TxInput type="password" autoComplete="new-password" value={verifyForm.password1} onChangeText={(password1) => _verifyForm({ password1 })} className="w-full" autoFocus />
          <TxForm.Label>현재 비밀번호 확인</TxForm.Label>
          <TxInput type="password" autoComplete="new-password-confirm" value={verifyForm.password2} onChangeText={(password2) => _verifyForm({ password2 })} className="w-full" />
          <TxForm.Label className="text-xs">{eMessage?.message && `⛔${eMessage.message}`}</TxForm.Label>
          <TxFlex className="gap-2 flex">
            <TxButton className="flex-1" label="확인" onClick={hdCheckVerifyForm} />
            <TxButton className="flex-1" label="취소" onClick={hdExit} />
          </TxFlex>
        </TxForm>
      ) : (
        <TxForm autoComplete="off" className="p-6 w-100">
          <TxInput type="text" name="username" className="w-px h-px" autoComplete="username" />
          <TxInput type="password" autoComplete="new-password" className="w-full hidden" />
          <TxInput type="password" autoComplete="new-password-confirm" className="w-full hidden" />
          <TxForm.Label>변경 비밀번호</TxForm.Label>
          <TxInput ref={nextREf} id="10" type="password" autoComplete="new-password" value={changeForm.password1} onChangeText={(password1) => hpChangeForm({ password1 })} className="w-full" autoFocus />
          <TxForm.Label>변경 비밀번호 확인</TxForm.Label>
          <TxInput id="20" type="password" autoComplete="new-password-confirm" value={changeForm.password2} onChangeText={(password2) => hpChangeForm({ password2 })} className="w-full" />
          <TxForm.Label className="text-xs">{eMessage?.message && `⛔${eMessage.message}`}</TxForm.Label>
          <TxFlex className="gap-2 flex">
            <TxButton className="flex-1" label="수정" onClick={hdModify} />
            <TxButton className="flex-1" label="취소" onClick={hdExit} />
          </TxFlex>
        </TxForm>
      )}
    </TxModal>
  );
};
