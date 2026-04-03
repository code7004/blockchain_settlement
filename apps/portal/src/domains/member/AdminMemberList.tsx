import { useStateForObject } from '@/core/hooks';
import { parseApiError } from '@/core/network';
import { TxButton, TxCoolTable, TxCoolTablePagination, TxCoolTableScroller, TxFieldDropdown, TxFieldInput, TxLoading, type ITxCoolTableOption, type ITxCoolTableRenderBodyProps } from '@/core/tx-ui';
import { bodyStyles, headStyles } from '@/lib/bodyStyles';
import { defaultBodyRenderer } from '@/lib/defaultBodyRenderer';
import { RexGroup } from '@/lib/regGroup';
import { useQuery } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { MemberRole, apiGetMembers, apiPatchMember, apiPostMember, type MemberDto } from './member.api';

const ITEMSIZE = 50;

const TableOptions: ITxCoolTableOption = {
  headStyles,
  bodyStyles,
  editColumns: ['callbackUrl', 'name', 'callbackSecret'],
};

const Member_ROLES = Object.values(MemberRole);

export default function AdminMemberList() {
  const [filter, _filter] = useStateForObject({ pageIdx: 1 });
  const [form, _form] = useStateForObject({ username: '', password: '', role: Member_ROLES[2] });
  const [eMessage, _eMessage] = useState<Record<string, string | undefined>>();
  const [selections, _selections] = useState<MemberDto[]>([]);

  const { data, refetch, isLoading } = useQuery({
    queryKey: ['members', filter],
    queryFn: async () => {
      const res = await apiGetMembers({ offset: (filter.pageIdx - 1) * ITEMSIZE, limit: ITEMSIZE });
      return { data: (res.data?.map((e, idx) => ({ IDX: (filter.pageIdx - 1) * ITEMSIZE + idx + 1, ...e })) as MemberDto[]) ?? [], total: res.total };
    },
    staleTime: 1000 * 60,
  });

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

      await apiPostMember(form);
      await refetch();
      _filter({ pageIdx: 1 });
      _eMessage(undefined);
    } catch (err) {
      const e = parseApiError(err);
      if (e.message.includes('username')) _eMessage({ username: e.message });
      else _eMessage({ password: e.message });
    }
  }

  async function hdChangeActive() {
    if (!selections || selections.length < 1) return;
    const target = selections[0];
    await apiPatchMember(target.id, { isActive: !target.isActive });
    _selections([]);
    refetch();
  }

  function hdRenderBody(props: ITxCoolTableRenderBodyProps<MemberDto, never>): ReactNode {
    switch (props.key) {
      default:
        return defaultBodyRenderer(props);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="flex items-end justify-end gap-3 mb-4">
        {selections?.length > 0 ? (
          <TxButton label={selections[0].isActive ? '선택 비활성' : '선택 활성'} onClick={hdChangeActive} />
        ) : (
          <>
            <TxFieldInput caption="username" onChangeText={(t) => _form({ username: t })} error={eMessage?.username} />
            <TxFieldInput caption="password" type="password" onChangeText={(t) => _form({ password: t })} error={eMessage?.password} />
            <TxFieldDropdown caption="role" data={Member_ROLES} value={form.role} onChangeValue={(t) => _form({ role: t.value as MemberRole })} />
            <TxButton label="생성하기" onClick={hdCreateItem} />
          </>
        )}
      </div>
      <TxCoolTableScroller className="flex-1 flex" footer={(data?.total ?? 0) > ITEMSIZE && <TxCoolTablePagination value={filter.pageIdx} itemCount={data?.total ?? 0} onChangePage={(e) => _filter({ pageIdx: e })} itemVisibleCount={ITEMSIZE} />}>
        {isLoading ? <TxLoading className="flex-1 h-full" visible /> : <TxCoolTable className="w-full text-sm text-center" data={data?.data} renderBody={hdRenderBody} options={TableOptions} onSelections={_selections} useCheckBox useRowSelect />}
      </TxCoolTableScroller>
    </div>
  );
}
