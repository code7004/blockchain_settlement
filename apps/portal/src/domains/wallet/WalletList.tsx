import type { SYS_PAGE_ROLE } from '@/constants';
import { TxCoolTable, TxCoolTablePagination, TxCoolTableScroller, TxFieldDropdown, TxLoading, TxSearchInput, type ITxCoolTableOption } from '@/core/tx-ui';

import { useStateForObject } from '@/core/hooks';
import { usePartners } from '@/hooks';
import { defaultBodyRenderer } from '@/lib/defaultBodyRenderer';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { useEffect } from 'react';
import { WalletStatus, apiGetWallets, type WalletDto } from './wallet.api';

const ITEMSIZE = 50;
const ActiveStatus = Object.values(WalletStatus);
export default function WalletList({ tableOptions, pageRole }: { pageRole: SYS_PAGE_ROLE; tableOptions: ITxCoolTableOption }) {
  const [filter, _filter] = useStateForObject({ pageIdx: 1, keyword: '', partnerId: '', status: '' });
  const { data: partners } = usePartners(pageRole);

  useEffect(() => void (partners?.[0]?.value && _filter({ partnerId: partners[0].value })), [partners, _filter]);

  const { data, isLoading } = useQuery({
    queryKey: ['wallets', filter],
    queryFn: async () => {
      if (!filter.partnerId) return { data: [], total: 0 };
      const res = await apiGetWallets({ offset: (filter.pageIdx - 1) * ITEMSIZE, limit: ITEMSIZE, ..._.pick(filter, ['partnerId', 'keyword', 'status']) });
      return { data: (res.data?.map((e, idx) => ({ IDX: idx + 1, ...e })) as WalletDto[]) ?? [], total: res.total };
    },
    enabled: !!filter.partnerId, // block condition
    staleTime: 1000 * 10,
    refetchInterval: 10000,
  });

  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="flex items-end justify-between gap-3 mb-4">
        <TxFieldDropdown caption="partner" value={filter.partnerId} data={partners} onChangeText={(t) => _filter({ partnerId: t, pageIdx: 1 })} />
        <TxFieldDropdown caption="status" data={ActiveStatus} onChangeText={(t) => _filter({ status: t, pageIdx: 1 })} addNoChoiceItem />
        <TxSearchInput className="flex-1" onSubmitText={(t) => _filter({ keyword: t, pageIdx: 1 })} placeholder="Search address" onClear={(t) => _filter({ keyword: t, pageIdx: 1 })} />
      </div>

      <TxCoolTableScroller className="flex-1 flex" footer={(data?.total ?? 0) > ITEMSIZE && <TxCoolTablePagination value={filter.pageIdx} itemCount={data?.total ?? 0} onChangePage={(e) => _filter({ pageIdx: e })} itemVisibleCount={ITEMSIZE} />}>
        {isLoading ? <TxLoading className="flex-1 h-full" visible /> : <TxCoolTable className="w-full text-sm text-center" data={data?.data} renderBody={defaultBodyRenderer} options={tableOptions} />}
      </TxCoolTableScroller>
    </div>
  );
}
