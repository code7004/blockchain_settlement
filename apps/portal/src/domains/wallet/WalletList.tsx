import { SYS_PAGE_ROLE } from '@/constants';
import { TxButton, TxCoolTable, TxCoolTablePagination, TxCoolTableScroller, TxFieldDropdown, TxLoading, TxSearchInput, type ITxCoolTableOption, type ITxCoolTableRenderBodyProps } from '@/core/tx-ui';

import { useStateForObject } from '@/core/hooks';
import { usePartners } from '@/hooks';
import { defaultBodyRenderer } from '@/lib/defaultBodyRenderer';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { useState, type ReactNode } from 'react';
import { WalletStatus, apiAssetsReclaim, apiGetAssets, apiGetWallets, type WalletDto } from './wallet.api';

const ITEMSIZE = 50;
const ActiveStatus = Object.values(WalletStatus);
export default function WalletList({ tableOptions, pageRole }: { pageRole: SYS_PAGE_ROLE; tableOptions: ITxCoolTableOption }) {
  const [filter, _filter] = useStateForObject({ pageIdx: 1, keyword: '', status: undefined as WalletStatus | undefined });
  const { partnerId, _partnerId, partners } = usePartners(pageRole);
  const [selections, _selections] = useState<WalletDto[]>([]);

  const { data, refetch, isLoading } = useQuery({
    queryKey: ['wallets', filter, partnerId],
    queryFn: async () => {
      if (!partnerId) return { data: [], total: 0 };
      const res = await apiGetWallets({ offset: (filter.pageIdx - 1) * ITEMSIZE, limit: ITEMSIZE, partnerId, ..._.pick(filter, ['keyword', 'status']) });
      return { data: (res.data?.map((e, idx) => ({ IDX: idx + 1, ...e })) as WalletDto[]) ?? [], total: res.total };
    },
    enabled: !!partnerId, // block condition
    staleTime: 1000 * 10,
    refetchInterval: 10000,
  });

  function hdRenderer(props: ITxCoolTableRenderBodyProps<WalletDto, never>): ReactNode {
    switch (props.key as keyof WalletDto | 'refetch') {
      case 'assetsSnapshot':
        return `trx: ${props.value?.coins?.trx}, ${import.meta.env.VITE_TOKEN_SYMBOL}: ${props.value?.tokens?.[import.meta.env.VITE_TOKEN_SYMBOL]}`;
      case 'refetch':
        return <TxButton label="자산 조회" variant="text" onClick={async () => void (await apiGetAssets(props.rowdata.id), refetch())} />;
      default:
        return defaultBodyRenderer(props);
    }
  }

  async function hdSweepAssets() {
    if (!partnerId) return;
    if (confirm('대상 지갑에 자산을 중앙지갑으로 전송 하시겠습니까?') == false) return;
    const res = await apiAssetsReclaim({ partnerId, status: filter.status, ids: selections.map((e) => e.id) });
    alert(`${res}개가 등록 되었습니다.\n워커가 처리 예정입니다.`);
  }

  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="flex items-end justify-between gap-3 mb-4">
        <TxFieldDropdown caption="partner" value={partnerId} data={partners} onChangeText={(t) => void (_partnerId(t), _filter({ pageIdx: 1 }))} />
        <TxFieldDropdown caption="status" data={ActiveStatus} onChangeValue={(t) => _filter({ status: t.value, pageIdx: 1 })} addNoChoiceItem />
        <TxSearchInput className="flex-1" onSubmitText={(t) => _filter({ keyword: t, pageIdx: 1 })} placeholder="Search address" onClear={(t) => _filter({ keyword: t, pageIdx: 1 })} />
        {pageRole == SYS_PAGE_ROLE.ADMIN && (
          <>
            <TxButton label={selections?.length > 0 ? '선택자산회수' : '전체자산회수'} onClick={hdSweepAssets} />
          </>
        )}
      </div>

      <TxCoolTableScroller className="flex-1 flex" footer={(data?.total ?? 0) > ITEMSIZE && <TxCoolTablePagination value={filter.pageIdx} itemCount={data?.total ?? 0} onChangePage={(e) => _filter({ pageIdx: e })} itemVisibleCount={ITEMSIZE} />}>
        {isLoading ? (
          <TxLoading className="flex-1 h-full" visible />
        ) : (
          <TxCoolTable className="w-full text-sm text-center" data={data?.data} renderBody={hdRenderer} options={tableOptions} onSelections={_selections} useMultiSelect useRowSelect useCheckBox />
        )}
      </TxCoolTableScroller>
    </div>
  );
}
