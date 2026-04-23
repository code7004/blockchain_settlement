import { SYS_PAGE_ROLE } from '@/constants';
import { TxCoolTable, TxCoolTablePagination, TxCoolTableScroller, TxFieldDropdown, TxLoading, TxSearchInput, type ITxCoolTableOption } from '@/core/tx-ui';

import { useStateForObject } from '@/core/hooks';
import { usePartners } from '@/hooks';
import { bodyStyles, headStyles } from '@/lib/bodyStyles';
import { defaultBodyRenderer } from '@/lib/defaultBodyRenderer';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { useEffect } from 'react';
import { apiGetWithdrawals, type IWithdrawal } from './withdrawall.api';

const ITEMSIZE = 50;
const TableOptions: ITxCoolTableOption = { headStyles, bodyStyles };

export default function WithdrawalList() {
  const [filter, _filter] = useStateForObject({ pageIdx: 1, partnerId: '', txHash: '' });

  const { partnerId, _partnerId, partners } = usePartners(SYS_PAGE_ROLE.PUBLIC);

  useEffect(() => void (partners?.[0]?.value && _filter({ partnerId: partners[0].value })), [partners, _filter]);

  const { data, isLoading } = useQuery({
    queryKey: ['withdrawalls', filter, partnerId],
    queryFn: async () => {
      if (!partnerId) return { data: [], total: 0 };
      const res = await apiGetWithdrawals({ offset: (filter.pageIdx - 1) * ITEMSIZE, limit: ITEMSIZE, ..._.pick(filter, ['partnerId', 'txHash']) });
      return { data: (res.data?.map((e, idx) => ({ IDX: idx + 1, ...e })) as IWithdrawal[]) ?? [], total: res.total };
    },
    enabled: !!partnerId, // block condition
    staleTime: 1000 * 10,
    refetchInterval: 10000,
  });

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-end justify-between gap-3 mb-4">
        <TxFieldDropdown caption="partner" value={partnerId} data={partners} onChangeText={(t) => void (_partnerId(t), _filter({ pageIdx: 1 }))} />
        <TxSearchInput className="flex-1" onSubmitText={(t) => _filter({ txHash: t, pageIdx: 1 })} placeholder="Search txHash" onClear={(t) => _filter({ txHash: t, pageIdx: 1 })} />
      </div>

      <TxCoolTableScroller className="flex-1 flex" footer={(data?.total ?? 0) > ITEMSIZE && <TxCoolTablePagination value={filter.pageIdx} itemCount={data?.total ?? 0} onChangePage={(e) => _filter({ pageIdx: e })} itemVisibleCount={ITEMSIZE} />}>
        {!isLoading ? <TxLoading className="flex-1 h-full" visible={true} /> : <TxCoolTable className="w-full text-sm text-center" data={data} renderBody={defaultBodyRenderer} options={TableOptions} />}
      </TxCoolTableScroller>
    </div>
  );
}
