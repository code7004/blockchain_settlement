import { SYS_PAGE_ROLE } from '@/constants';
import { useStateForObject } from '@/core/hooks';
import { parseApiError } from '@/core/network';
import type { ITxAgGridOption } from '@/core/tx-ui';
import { TxAgGrid, TxButton, TxFlex, TxForm } from '@/core/tx-ui';
import { usePartners } from '@/hooks';
import { useQuery } from '@tanstack/react-query';
import type { CellValueChangedEvent } from 'ag-grid-community';
import dayjs from 'dayjs';
import { useState } from 'react';
import { apiPatchUser, getUsers, postAdminUser, type UserDto } from './user.api';

const ITEMSIZE = 50;

const ActiveStatus = [true, false];

export default function UserList({ tableOptions, pageRole }: { pageRole: SYS_PAGE_ROLE; tableOptions: ITxAgGridOption }) {
  const [filter, _filter] = useStateForObject<{ offset: number; limit: number; isActive?: boolean }>({ offset: 0, limit: ITEMSIZE, isActive: undefined });
  const [form, _form] = useStateForObject<{ externalUserId: string }>({ externalUserId: 'string' });
  const [eMessage, _eMessage] = useState<Record<string, string | undefined>>();

  const { partnerId, _partnerId, partners } = usePartners(pageRole);

  const { data, refetch, isLoading } = useQuery({
    queryKey: ['users', filter, partnerId],
    queryFn: async () => {
      if (!partnerId) return { data: [], total: 0 };
      const res = await getUsers({ ...filter, partnerId });
      return { data: res.data, total: res.total };
    },
    enabled: !!partnerId && partnerId != '', // block condition
    staleTime: 1000 * 10,
    refetchInterval: 10000,
  });

  const validateForm = () => {
    if (partnerId == '') return { partnerId: 'partnerId을 입력하세요' };
    else if (form.externalUserId == '') return { externalUserId: 'externalUserId 입력하세요' };
    return undefined;
  };

  async function hdCreateItem() {
    try {
      if (!partnerId) return;
      const valid = validateForm();
      if (valid) return _eMessage(valid);

      await postAdminUser({ partnerId: partnerId, externalUserId: form.externalUserId });
      await refetch();
      _filter({ offset: 0 });
      _eMessage(undefined);
    } catch (err) {
      const e = parseApiError(err);
      if (e.message.includes('partnerId')) _eMessage({ partnerId: e.message });
      else if (e.message.includes('externalUserId')) _eMessage({ externalUserId: e.message });
      else _eMessage({ externalUserId: e.message });

      console.log(e);
    }
  }

  async function hdChangeRow(event: CellValueChangedEvent<UserDto>) {
    await apiPatchUser(event.data.id, { isActive: event.value });
    refetch();
  }

  return (
    <TxFlex className="flex-1 flex-col gap-2">
      <TxFlex className="flex-row items-end justify-between gap-3 mb-4">
        <TxForm className="flex flex-row gap-3">
          <TxForm.Dropdown caption="partner" value={partnerId} data={partners} onChangeText={(t) => void (_partnerId(t), _filter({ offset: 0 }))} />
          <TxForm.Dropdown caption="active" data={ActiveStatus} onChangeBool={(t) => _filter({ isActive: t, offset: 0 })} addNoChoiceItem />
          <TxForm.DayPickerRange caption="검색기간" value={[dayjs().add(-6, 'day').toDate(), dayjs().toDate()]} />
        </TxForm>
        <TxForm className="flex flex-row items-end justify-between gap-3 ">
          <TxForm.Input caption="externalUserId" onChangeText={(t) => _form({ externalUserId: t })} error={eMessage?.externalUserId} />
          <TxButton label="생성하기" onClick={hdCreateItem} />
        </TxForm>
      </TxFlex>
      <TxAgGrid
        rowData={data?.data}
        option={tableOptions}
        isLoading={isLoading}
        defaultColDef={{ flex: 1 }}
        offset={filter.offset}
        pagination={{
          currentPage: 1 + filter.offset / ITEMSIZE,
          totalRows: data?.total ?? 0,
          pageSize: ITEMSIZE,
          onChangePage: (page) => _filter({ offset: (page - 1) * ITEMSIZE }),
        }}
        onCellValueChanged={hdChangeRow}
      />
    </TxFlex>
  );
}
