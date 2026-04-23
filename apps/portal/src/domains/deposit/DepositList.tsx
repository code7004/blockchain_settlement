import type { SYS_PAGE_ROLE } from '@/constants';
import { useStateForObject } from '@/core/hooks';
import { TxCoolTable, TxCoolTablePagination, TxCoolTableScroller, TxFieldDropdown, TxLoading, TxSearchInput, type ITxCoolTableOption } from '@/core/tx-ui';
import { usePartners } from '@/hooks';
import { defaultBodyRenderer } from '@/lib/defaultBodyRenderer';
import { useQuery } from '@tanstack/react-query';
import { apiGetDeposits, type DepositDto } from './deposit.api';

const ITEMSIZE = 50;

export default function DepositList({ tableOptions, pageRole }: { pageRole: SYS_PAGE_ROLE; tableOptions: ITxCoolTableOption }) {
  const [filter, _filter] = useStateForObject({ offset: 0, limit: ITEMSIZE, txHash: '' });

  const { partnerId, _partnerId, partners } = usePartners(pageRole);

  const { data, isLoading } = useQuery({
    queryKey: ['deposits', filter, partnerId],
    queryFn: async () => {
      if (!partnerId) return { data: [], total: 0 };
      const res = await apiGetDeposits({ partnerId, ...filter });
      return { data: (res.data?.map((e, idx) => ({ IDX: idx + 1, ...e })) as DepositDto[]) ?? [], total: res.total };
    },
    enabled: !!partnerId, // block condition
    staleTime: 1000 * 10,
    refetchInterval: 10000,
  });

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-end justify-between gap-3 mb-4">
        <TxFieldDropdown caption="partner" value={partnerId} data={partners} onChangeText={(t) => void (_partnerId(t), _filter({ offset: 0 }))} />
        <TxSearchInput className="flex-1" onSubmitText={(t) => _filter({ txHash: t, offset: 0 })} placeholder="Search txHash" onClear={(t) => _filter({ txHash: t, offset: 0 })} />
      </div>

      <TxCoolTableScroller
        className="flex-1 flex"
        footer={(data?.total ?? 0) > ITEMSIZE && <TxCoolTablePagination value={1 + filter.offset / ITEMSIZE} itemCount={data?.total ?? 0} onChangePage={(e) => _filter({ offset: (e - 1) * ITEMSIZE })} itemVisibleCount={ITEMSIZE} />}
      >
        {isLoading ? <TxLoading className="flex-1 h-full" visible={true} /> : <TxCoolTable className="w-full text-sm text-center" data={data?.data} renderBody={defaultBodyRenderer} options={tableOptions} />}
      </TxCoolTableScroller>
    </div>
  );
}
