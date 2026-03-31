import { TxDropdownPatners } from '@/components/TxDropdownPartners';
import type { SYS_PAGE_ROLE } from '@/constants';
import { TxCoolTable, TxCoolTablePagination, TxCoolTableScroller, TxLoading, TxSearchInput, type ITxCoolTableOption } from '@/core/tx-ui';

import { defaultBodyRenderer } from '@/lib/defaultBodyRenderer';
import { useEffect, useState } from 'react';
import { getAdminWallets, type IWallet } from './wallet.api';

const ITEMSIZE = 50;
export default function WalletList({ tableOptions, pageRole }: { pageRole: SYS_PAGE_ROLE; tableOptions: ITxCoolTableOption }) {
  const [data, _data] = useState<IWallet[]>([]);
  const [pageIdx, _pageIdx] = useState(1);
  const [itemCount, _itemCount] = useState(1);
  const [partnerId, _partnerId] = useState<string>();

  const [keyword, _keyword] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!partnerId) return;
      const res = await getAdminWallets({ offset: (pageIdx - 1) * ITEMSIZE, limit: ITEMSIZE, partnerId, keyword });
      _data(res.data?.map((e, idx) => ({ IDX: idx + 1, ...e })));
      _itemCount(res.total);
    };

    void fetchData();
  }, [pageIdx, partnerId, keyword]);

  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="flex items-end justify-between gap-3 mb-4">
        <TxDropdownPatners onChangeText={_partnerId} pageRole={pageRole} />
        <TxSearchInput className="flex-1" onSubmitText={_keyword} placeholder="Search address" />
      </div>
      <TxCoolTableScroller className="flex-1 flex" footer={itemCount > ITEMSIZE && <TxCoolTablePagination value={pageIdx} itemCount={itemCount} onChangePage={_pageIdx} itemVisibleCount={ITEMSIZE} />}>
        {!data ? <TxLoading className="flex-1 h-full" visible={true} /> : <TxCoolTable className="w-full text-sm text-center" data={data} renderBody={defaultBodyRenderer} options={tableOptions} />}
      </TxCoolTableScroller>
    </div>
  );
}
