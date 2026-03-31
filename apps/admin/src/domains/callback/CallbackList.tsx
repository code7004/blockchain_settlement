import { TxDropdownPatners } from '@/components/TxDropdownPartners';
import { CallbackStatus, type SYS_PAGE_ROLE } from '@/constants';
import { TxButton, TxCoolTable, TxCoolTablePagination, TxCoolTableScroller, TxDropdown, TxLoading, TxSearchInput, type ITxCoolTableOption } from '@/core/tx-ui';
import { defaultBodyRenderer } from '@/lib/defaultBodyRenderer';
import { useCallback, useEffect, useState } from 'react';
import { fetchAdminCallbacks, postCallbackRetryAll, postCallbackRetryIds, type ICallback } from './callback.api';

const ITEMSIZE = 50;

export default function CallbackList({ tableOptions, pageRole }: { pageRole: SYS_PAGE_ROLE; tableOptions: ITxCoolTableOption }) {
  const [data, _data] = useState<ICallback[]>([]);
  const [pageIdx, _pageIdx] = useState(1);
  const [itemCount, _itemCount] = useState(1);
  const [partnerId, _partnerId] = useState<string>();
  const [keyword, _keyword] = useState('');
  const [status, _status] = useState<string>();
  const [selections, _selections] = useState<ICallback[]>();

  const Status = [CallbackStatus.PENDING, CallbackStatus.FAILED, CallbackStatus.SUCCESS];

  const fetchData = useCallback(async () => {
    if (!partnerId) return;
    // if (selections && selections.length > 0) return;

    const res = await fetchAdminCallbacks({ offset: (pageIdx - 1) * ITEMSIZE, limit: ITEMSIZE, partnerId, depositId: keyword, status });
    _data(res.data?.map((e, idx) => ({ IDX: idx + 1, ...e })));
    _itemCount(res.total);
  }, [pageIdx, partnerId, keyword, status]);

  // useSafePolling(fetchData, 10000).start();

  useEffect(() => {
    void (async () => fetchData())();
  }, [fetchData]);

  async function hdCallbackRetryIds() {
    if (!selections) return alert('선택 콜백이 없습니다.');
    if (!partnerId) return;

    if (!confirm('선택 콜백을 재시도 하겠습니까?\n상태가 FAILED 인경우 재시도 합니다.')) return;
    await postCallbackRetryIds({ partnerId, ids: selections.map((e) => e.id) });
    await fetchData();
  }

  async function hdCallbackRetryAll() {
    if (!partnerId) return;
    if (!confirm('실패된 콜백 전체를 재시도 하겠습니까?')) return;
    await postCallbackRetryAll({ partnerId });
    await fetchData();
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-end justify-between gap-3 mb-4">
        <TxDropdownPatners onChangeText={_partnerId} pageRole={pageRole} />
        <TxDropdown data={Status} onChangeText={_status} addNoChoiceItem />
        <TxSearchInput className="flex-1" onSubmitText={_keyword} placeholder="Search depositId" />
        <TxButton label="선택 재시도" onClick={hdCallbackRetryIds} />
        <TxButton disabled={status != CallbackStatus.FAILED} label="전체 재시도" onClick={hdCallbackRetryAll} />
      </div>

      <TxCoolTableScroller className="flex-1 flex" footer={itemCount > ITEMSIZE && <TxCoolTablePagination value={pageIdx} itemCount={itemCount} onChangePage={_pageIdx} itemVisibleCount={ITEMSIZE} />}>
        {!data ? (
          <TxLoading className="flex-1 h-full" visible={true} />
        ) : (
          <TxCoolTable className="w-full text-sm text-center" data={data} renderBody={defaultBodyRenderer} options={tableOptions} useCheckBox useRowSelect useMultiSelect onSelections={_selections} />
        )}
      </TxCoolTableScroller>
    </div>
  );
}
