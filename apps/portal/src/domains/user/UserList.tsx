import { SYS_PAGE_ROLE } from '@/constants';
import { useStateForObject } from '@/core/hooks';
import { parseApiError } from '@/core/network';
import type { ITxCoolTableOption } from '@/core/tx-ui';
import { TxButton, TxCoolTable, TxCoolTablePagination, TxCoolTableScroller, TxFieldDropdown, TxFieldInput, TxLoading } from '@/core/tx-ui';
import { usePartners } from '@/hooks';
import { defaultBodyRenderer } from '@/lib/defaultBodyRenderer';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { apiPatchUser, getUsers, postAdminUser, type UserDto } from './user.api';

const ITEMSIZE = 50;

const ActiveStatus = [true, false];

export default function UserList({ tableOptions, pageRole }: { pageRole: SYS_PAGE_ROLE; tableOptions: ITxCoolTableOption }) {
  const [filter, _filter] = useStateForObject<{ pageIdx: number; isActive?: boolean }>({ pageIdx: 1, isActive: undefined });
  const [form, _form] = useStateForObject<{ externalUserId: string }>({ externalUserId: 'string' });
  const [eMessage, _eMessage] = useState<Record<string, string | undefined>>();
  const [selections, _selections] = useState<UserDto[]>([]);

  const { partnerId, _partnerId, partners } = usePartners(pageRole);

  const { data, refetch, isLoading } = useQuery({
    queryKey: ['users', filter, partnerId],
    queryFn: async () => {
      if (!partnerId) return { data: [], total: 0 };
      const res = await getUsers({ offset: (filter.pageIdx - 1) * ITEMSIZE, limit: ITEMSIZE, partnerId, isActive: filter.isActive });
      return { data: (res.data?.map((e, idx) => ({ IDX: idx + 1, ...e })) as UserDto[]) ?? [], total: res.total };
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
      _filter({ pageIdx: 1 });
      _eMessage(undefined);
    } catch (err) {
      const e = parseApiError(err);
      if (e.message.includes('partnerId')) _eMessage({ partnerId: e.message });
      else if (e.message.includes('externalUserId')) _eMessage({ externalUserId: e.message });
      else _eMessage({ externalUserId: e.message });

      console.log(e);
    }
  }

  async function hdChangeActive() {
    if (!selections || selections.length < 1) return;
    const target = selections[0];
    await apiPatchUser(target.id, { isActive: !target.isActive });
    refetch();
    _selections([]);
  }

  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="flex items-end justify-between gap-3 mb-4">
        <div className="flex gap-3">
          <TxFieldDropdown caption="partner" value={partnerId} data={partners} onChangeText={(t) => void (_partnerId(t), _filter({ pageIdx: 1 }))} />
          <TxFieldDropdown caption="active" data={ActiveStatus} onChangeBool={(t) => _filter({ isActive: t, pageIdx: 1 })} addNoChoiceItem />
        </div>
        {selections?.length > 0 ? (
          <TxButton label={selections[0].isActive ? '선택 비활성' : '선택 활성'} onClick={hdChangeActive} />
        ) : (
          <div className="flex items-end justify-between gap-3 ">
            <TxFieldInput caption="externalUserId" onChangeText={(t) => _form({ externalUserId: t })} error={eMessage?.externalUserId} />
            <TxButton label="생성하기" onClick={hdCreateItem} />
          </div>
        )}
      </div>
      <TxCoolTableScroller className="flex-1 flex" footer={(data?.total ?? 0) > ITEMSIZE && <TxCoolTablePagination value={filter.pageIdx} itemCount={data?.total ?? 0} onChangePage={(e) => _filter({ pageIdx: e })} itemVisibleCount={ITEMSIZE} />}>
        {isLoading ? (
          <TxLoading className="flex-1 h-full" visible={true} />
        ) : (
          <TxCoolTable className="w-full text-sm text-center" data={data?.data} renderBody={defaultBodyRenderer} options={tableOptions} onSelections={_selections} useCheckBox useRowSelect />
        )}
      </TxCoolTableScroller>
    </div>
  );
}
