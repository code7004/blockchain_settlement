import { TxDropdownPatners } from '@/components/TxDropdownPartners';
import type { SYS_PAGE_ROLE } from '@/constants';
import { useSafePolling } from '@/core/hooks';
import { TxCoolTable, TxCoolTablePagination, TxCoolTableScroller, TxLoading, TxSearchInput, type ITxCoolTableOption } from '@/core/tx-ui';
import { defaultBodyRenderer } from '@/lib/defaultBodyRenderer';
import { useCallback, useEffect, useState } from 'react';
import { fetchAdminDeposits, type IDeposit } from './deposit.api';

const ITEMSIZE = 50;

export default function DepositList({ tableOptions, pageRole }: { pageRole: SYS_PAGE_ROLE; tableOptions: ITxCoolTableOption }) {
  const [data, _data] = useState<IDeposit[]>([]);
  const [pageIdx, _pageIdx] = useState(1);
  const [itemCount, _itemCount] = useState(1);
  const [partnerId, _partnerId] = useState<string>();
  const [keyword, _keyword] = useState<string>();

  const fetchData = useCallback(async () => {
    if (!partnerId) return;
    const res = await fetchAdminDeposits({ offset: (pageIdx - 1) * ITEMSIZE, limit: ITEMSIZE, partnerId, txHash: keyword });
    _data(res.data?.map((e, idx) => ({ IDX: idx + 1, ...e })));
    _itemCount(res.total);
  }, [pageIdx, partnerId, keyword]);

  useEffect(() => {
    void (async () => fetchData())();
  }, [fetchData]);

  useSafePolling(fetchData, 10000);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-end justify-between gap-3 mb-4">
        <TxDropdownPatners onChangeText={_partnerId} pageRole={pageRole} />
        <TxSearchInput className="flex-1" onSubmitText={_keyword} placeholder="Search txHash" />
      </div>

      <TxCoolTableScroller className="flex-1 flex" footer={itemCount > ITEMSIZE && <TxCoolTablePagination value={pageIdx} itemCount={itemCount} onChangePage={_pageIdx} itemVisibleCount={ITEMSIZE} />}>
        {!data ? <TxLoading className="flex-1 h-full" visible={true} /> : <TxCoolTable className="w-full text-sm text-center" data={data} renderBody={defaultBodyRenderer} options={tableOptions} />}
      </TxCoolTableScroller>
    </div>
  );
}
