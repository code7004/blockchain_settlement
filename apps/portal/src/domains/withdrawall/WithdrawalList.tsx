import { SYS_PAGE_ROLE } from '@/constants';
import { TxCoolTable, TxCoolTablePagination, TxCoolTableScroller, TxFlex, TxForm, TxLoading, type ITxAgGridOption } from '@/core/tx-ui';

import { useStateForObject } from '@/core/hooks';
import { usePartners } from '@/hooks';
import { customColumnDefs, defaultBodyRenderer } from '@/lib/defaultBodyRenderer';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { apiGetWithdrawals, type IWithdrawal } from './withdrawall.api';

const ITEMSIZE = 50;
const TableOptions: ITxAgGridOption = { customColumnDefs };

export default function WithdrawalList() {
  const [filter, _filter] = useStateForObject({ offset: 0, limit: ITEMSIZE, partnerId: '', txHash: '' });

  const { partnerId, _partnerId, partners } = usePartners(SYS_PAGE_ROLE.PUBLIC);

  useEffect(() => void (partners?.[0]?.value && _filter({ partnerId: partners[0].value })), [partners, _filter]);

  const { data, isLoading } = useQuery({
    queryKey: ['withdrawalls', filter, partnerId],
    queryFn: async () => {
      if (!partnerId) return { data: [], total: 0 };
      const res = await apiGetWithdrawals(filter);
      return { data: (res.data?.map((e, idx) => ({ IDX: idx + 1, ...e })) as IWithdrawal[]) ?? [], total: res.total };
    },
    enabled: !!partnerId, // block condition
    staleTime: 1000 * 10,
    refetchInterval: 10000,
  });

  return (
    <TxFlex className="flex-1 flex-col">
      <TxForm className="flex flex-row items-end justify-between gap-3 mb-4">
        <TxForm.Dropdown caption="partner" value={partnerId} data={partners} onChangeText={(t) => void (_partnerId(t), _filter({ offset: 0 }))} />
        <TxForm.SearchInput className="flex-1" onSubmitText={(t) => _filter({ txHash: t, offset: 0 })} placeholder="Search txHash" onClear={(t) => _filter({ txHash: t, offset: 0 })} />
      </TxForm>

      <TxCoolTableScroller className="flex-1 flex" footer={(data?.total ?? 0) > ITEMSIZE && <TxCoolTablePagination value={filter.offset} itemCount={data?.total ?? 0} itemVisibleCount={ITEMSIZE} />}>
        {!isLoading ? <TxLoading className="flex-1 h-full" visible={true} /> : <TxCoolTable className="w-full text-sm text-center" data={data} renderBody={defaultBodyRenderer} options={TableOptions} />}
      </TxCoolTableScroller>
    </TxFlex>
  );
}
