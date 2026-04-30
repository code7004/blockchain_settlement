import { useStateForObject } from '@/core/hooks';
import { parseApiError } from '@/core/network';
import { TxAgGrid, TxButton, TxFlex, TxForm, type ITxAgGridOption } from '@/core/tx-ui';
import { basicColumnDefs } from '@/lib/defaultBodyRenderer';
import { RexGroup } from '@/lib/regGroup';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { CellValueChangedEvent } from 'ag-grid-community';
import { useState } from 'react';
import { MemberRole, apiGetMembers, apiPatchMember, apiPostMember, type MemberDto } from './member.api';

const ITEMSIZE = 50;
const QUERYKEY = 'member';

const TableOptions: ITxAgGridOption = {
  customColumnDefs: basicColumnDefs,
  editColumns: ['isActive'],
};

const Member_ROLES = Object.values(MemberRole);

export default function AdminMemberList() {
  const [filter, _filter] = useStateForObject({ offset: 0, limit: ITEMSIZE });
  const [form, _form] = useStateForObject({ username: '', password: '', role: Member_ROLES[2] });
  const [eMessage, _eMessage] = useState<Record<string, string | undefined>>();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: [QUERYKEY, filter],
    queryFn: async () => {
      const res = await apiGetMembers(filter);
      return { data: res.data, total: res.total };
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
      await queryClient.invalidateQueries({ queryKey: [QUERYKEY] });
      _eMessage(undefined);
    } catch (err) {
      const e = parseApiError(err);
      if (e.message.includes('username')) _eMessage({ username: e.message });
      else _eMessage({ password: e.message });
    }
  }

  async function hdChangeItem(event: CellValueChangedEvent<MemberDto>) {
    await apiPatchMember(event.data.id, { isActive: event.value });
    await queryClient.invalidateQueries({ queryKey: [QUERYKEY] });
  }

  return (
    <TxFlex className="flex flex-1 flex-col gap-2">
      <TxForm className="flex flex-row items-end justify-end gap-3 mb-4">
        <TxForm.Input caption="username" onChangeText={(t) => _form({ username: t })} error={eMessage?.username} />
        <TxForm.Input caption="password" type="password" onChangeText={(t) => _form({ password: t })} error={eMessage?.password} />
        <TxForm.Dropdown caption="role" data={Member_ROLES} value={form.role} onChangeValue={(t) => _form({ role: t.value as MemberRole })} />
        <TxButton label="생성하기" onClick={hdCreateItem} />
      </TxForm>

      <TxAgGrid
        rowData={data?.data}
        option={TableOptions}
        isLoading={isLoading}
        defaultColDef={{ flex: 1 }}
        offset={filter.offset}
        pagination={{
          currentPage: 1 + filter.offset / ITEMSIZE,
          totalRows: data?.total ?? 0,
          pageSize: ITEMSIZE,
          onChangePage: (page) => _filter({ offset: (page - 1) * ITEMSIZE }),
        }}
        onCellValueChanged={hdChangeItem}
      />
    </TxFlex>
  );
}
