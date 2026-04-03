import { SYS_PAGE_ROLE } from '@/constants';
import { useStateForObject } from '@/core/hooks';
import { parseApiError } from '@/core/network';
import { TxButton, TxCoolTable, TxCoolTablePagination, TxCoolTableScroller, TxFieldDropdown, TxLoading, TxSearchInput, type ITxCoolTableChangeCellEvent, type ITxCoolTableOption } from '@/core/tx-ui';
import { usePartners } from '@/hooks';
import { defaultBodyRenderer } from '@/lib/defaultBodyRenderer';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { CallbackStatus, apiGetCallbacks, apiPatchCallback, apiPostCallbackRetryAll, apiPostCallbackRetryIds, type CallbackDto, type CallbackGetDto, type CallbackPatchDto } from './callback.api';

const ITEMSIZE = 50;
const Status = [CallbackStatus.PENDING, CallbackStatus.FAILED, CallbackStatus.SUCCESS];

export default function CallbackList({ tableOptions, pageRole }: { pageRole: SYS_PAGE_ROLE; tableOptions: ITxCoolTableOption }) {
  const [filter, _filter] = useStateForObject<{ pageIdx: number } & CallbackGetDto>({ pageIdx: 1, id: '', partnerId: '', status: undefined });
  const { data: partners } = usePartners(pageRole);

  const [selections, _selections] = useState<CallbackDto[]>();

  useEffect(() => void (partners?.[0]?.value && _filter({ partnerId: partners[0].value })), [partners, _filter]);

  const { data, refetch, isLoading } = useQuery({
    queryKey: ['wallets', filter],
    queryFn: async () => {
      if (!filter.partnerId) return { data: [], total: 0 };
      const res = await apiGetCallbacks({ offset: (filter.pageIdx - 1) * ITEMSIZE, limit: ITEMSIZE, ..._.pick(filter, ['partnerId', 'status', 'id']) });
      return { data: (res.data?.map((e, idx) => ({ IDX: (filter.pageIdx - 1) * ITEMSIZE + idx + 1, ...e })) as CallbackDto[]) ?? [], total: res.total };
    },
    enabled: !!filter.partnerId, // block condition
    staleTime: 1000 * 10,
    refetchInterval: 10000,
  });

  async function hdCallbackRetryIds() {
    if (!selections || selections.length < 1) return alert('선택 콜백이 없습니다.');

    if (!confirm('선택 콜백을 재시도 하겠습니까?\n상태가 FAILED 인경우 재시도 합니다.')) return;
    await apiPostCallbackRetryIds({ partnerId: filter.partnerId, ids: selections.map((e) => e.id) });
    await refetch();
  }

  async function hdCallbackRetryAll() {
    if (!confirm('실패된 콜백 전체를 재시도 하겠습니까?')) return;
    await apiPostCallbackRetryAll({ partnerId: filter.partnerId });
    await refetch();
  }

  async function hdChangeCell(change: ITxCoolTableChangeCellEvent<CallbackDto, never>) {
    if (!confirm('내용을 변경 하시겠습니까?')) return false;
    try {
      await apiPatchCallback(change.rowdata.id, { [change.key]: change.newValue } as CallbackPatchDto);
      return true;
    } catch (err) {
      alert(parseApiError(err)?.message);
      return false;
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-end justify-between gap-3 mb-4">
        <TxFieldDropdown caption="partner" value={filter.partnerId} data={partners} onChangeText={(t) => _filter({ partnerId: t, pageIdx: 1 })} />
        <TxFieldDropdown caption="status" data={Status} onChangeValue={(t) => _filter({ status: t.value as CallbackStatus, pageIdx: 1 })} addNoChoiceItem />
        <TxSearchInput className="flex-1" onSubmitText={(t) => _filter({ id: t, pageIdx: 1 })} placeholder="Search id" onClear={(t) => _filter({ id: t, pageIdx: 1 })} />
        <TxButton label="선택 재시도" onClick={hdCallbackRetryIds} />
        <TxButton disabled={status != CallbackStatus.FAILED} label="전체 재시도" onClick={hdCallbackRetryAll} />
      </div>

      <TxCoolTableScroller className="flex-1 flex" footer={(data?.total ?? 0) > ITEMSIZE && <TxCoolTablePagination value={filter.pageIdx} itemCount={data?.total ?? 0} onChangePage={(e) => _filter({ pageIdx: e })} itemVisibleCount={ITEMSIZE} />}>
        {isLoading ? (
          <TxLoading className="flex-1 h-full" visible={true} />
        ) : (
          <TxCoolTable className="w-full text-sm text-center" data={data?.data} renderBody={defaultBodyRenderer} options={tableOptions} useCheckBox useRowSelect useMultiSelect onSelections={_selections} onChangeCell={hdChangeCell} />
        )}
      </TxCoolTableScroller>
    </div>
  );
}
