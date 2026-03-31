import { useStateForObject } from '@/core/hooks';
import { parseApiError } from '@/core/network';
import { TxButton, TxCoolTable, TxCoolTablePagination, TxCoolTableScroller, TxFieldDropdown, TxFieldInput, type ITxCoolTableOption } from '@/core/tx-ui';
import { bodyStyles, headStyles } from '@/lib/bodyStyles';
import { defaultBodyRenderer } from '@/lib/defaultBodyRenderer';
import { RexGroup } from '@/lib/regGroup';
import { useCallback, useEffect, useState } from 'react';
import { getAdminMembers, postAdminMember, removeAdminMembers, type IMembers } from './member.api';

const ITEMSIZE = 50;

const TableOptions: ITxCoolTableOption = {
  headStyles,
  bodyStyles,
  editColumns: ['callbackUrl', 'name', 'callbackSecret'],
};

const Member_ROLES = ['OWNER', 'OPERATOR', 'DEVELOPER'];

export default function AdminMemberList() {
  const [data, _data] = useState<IMembers[]>([]);
  const [pageIdx, _pageIdx] = useState(1);
  const [itemCount, _itemCount] = useState(1);
  const [form, _form] = useStateForObject({ username: '', password: '', role: Member_ROLES[2] });
  const [eMessage, _eMessage] = useState<Record<string, string | undefined>>();
  const [selections, _selections] = useState<string[]>([]);

  const fetchData = useCallback(async () => {
    const res = await getAdminMembers({ offset: (pageIdx - 1) * ITEMSIZE, limit: ITEMSIZE });
    _data(res.data?.map((e, idx) => ({ IDX: idx + 1, ...e })));
    _itemCount(res.total);
  }, [pageIdx]);

  useEffect(() => {
    void (() => fetchData())();
  }, [fetchData]);

  const validateForm = () => {
    if (form.username == '') return { username: 'username을 입력하세요' };
    else if (RexGroup.username.reg.test(form.username) == false) return { username: RexGroup.username.message };
    else if (form.password == '') return { password: 'password를 입력하세요' };
    else if (RexGroup.password.reg.test(form.password) == false) return { password: RexGroup.password.message };
    return undefined;
  };

  async function hdCreateItem() {
    try {
      const valid = validateForm();
      if (valid) return _eMessage(valid);

      await postAdminMember(form);
      await fetchData();
      _pageIdx(1);
      _eMessage(undefined);
    } catch (err) {
      const e = parseApiError(err);
      if (e.message.includes('username')) _eMessage({ username: e.message });
      else _eMessage({ password: e.message });
    }
  }

  async function hdRemoveItems() {
    await removeAdminMembers(selections);
    _pageIdx(1);
  }

  if (!data) return <div>Loading...</div>;
  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="flex items-end justify-end gap-3 mb-4">
        {selections?.length > 0 ? (
          <TxButton label="선택 비활성" onClick={hdRemoveItems} />
        ) : (
          <>
            <TxFieldInput caption="username" onChangeText={(t) => _form({ username: t })} error={eMessage?.username} />
            <TxFieldInput caption="password" type="password" onChangeText={(t) => _form({ password: t })} error={eMessage?.password} />
            <TxFieldDropdown caption="role" data={Member_ROLES} value={form.role} onChangeText={(t) => _form({ role: t })} />
            <TxButton label="생성하기" onClick={hdCreateItem} />
          </>
        )}
      </div>
      <TxCoolTableScroller className="flex-1 flex" footer={itemCount > ITEMSIZE && <TxCoolTablePagination value={pageIdx} itemCount={itemCount} onChangePage={_pageIdx} itemVisibleCount={ITEMSIZE} />}>
        <TxCoolTable className="w-full text-sm text-center" data={data} renderBody={defaultBodyRenderer} options={TableOptions} onSelections={(items) => _selections(items.map((e) => e.id))} useCheckBox useMultiSelect />
      </TxCoolTableScroller>
    </div>
  );
}
