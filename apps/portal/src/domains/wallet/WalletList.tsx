import { SYS_PAGE_ROLE } from '@/constants';
import { TxAgGrid, TxButton, TxFlex, TxForm, type ITxCoolTableOption } from '@/core/tx-ui';

import { useStateForObject } from '@/core/hooks';
import { usePartners } from '@/hooks';
import { useQuery } from '@tanstack/react-query';
import type { CellClickedEvent, SelectionChangedEvent } from 'ag-grid-community';
import { useState } from 'react';
import { WalletStatus, apiAssetsReclaim, apiGetAssets, apiGetWallets, type WalletDto } from './wallet.api';

const ITEMSIZE = 50;
const ActiveStatus = Object.values(WalletStatus);
export default function WalletList({ tableOptions, pageRole }: { pageRole: SYS_PAGE_ROLE; tableOptions: ITxCoolTableOption }) {
  const [filter, _filter] = useStateForObject({ offset: 0, limit: ITEMSIZE, keyword: '', status: undefined as WalletStatus | undefined });
  const { partnerId, _partnerId, partners } = usePartners(pageRole);
  const [selections, _selections] = useState<WalletDto[]>([]);

  const { data, refetch, isLoading } = useQuery({
    queryKey: ['wallets', filter, partnerId],
    queryFn: async () => {
      if (!partnerId) return { data: [], total: 0 };
      const res = await apiGetWallets({ partnerId, ...filter });
      return { data: (res.data?.map((e, idx) => ({ IDX: idx + 1, ...e })) as WalletDto[]) ?? [], total: res.total };
    },
    enabled: !!partnerId, // block condition
    staleTime: 1000 * 10,
    refetchInterval: 10000,
  });

  async function hdSweepAssets() {
    if (!partnerId) return;
    if (confirm('대상 지갑에 자산을 중앙지갑으로 전송 하시겠습니까?') == false) return;
    const res = await apiAssetsReclaim({ partnerId, status: filter.status, ids: selections.map((e) => e.id) });
    alert(`${res}개가 등록 되었습니다.\n워커가 처리 예정입니다.`);
  }

  async function hdCellClicked(event: CellClickedEvent<WalletDto>) {
    if (event.column.getColId() == 'refetch' && event.data) {
      await apiGetAssets(event.data.id);
      refetch();
    }
  }

  function hdSelectionChangeddddd(event: SelectionChangedEvent<WalletDto>): void {
    _selections(event.selectedNodes?.map((e) => e.data) as WalletDto[]);
  }

  return (
    <TxFlex className="flex-1 flex-col gap-2">
      <TxForm className="flex flex-row items-end justify-between gap-3 mb-4">
        <TxForm.Dropdown caption="partner" value={partnerId} data={partners} onChangeText={(t) => void (_partnerId(t), _filter({ offset: 0 }))} />
        <TxForm.Dropdown caption="status" data={ActiveStatus} onChangeValue={(t) => _filter({ status: t.value, offset: 0 })} addNoChoiceItem />
        <TxForm.SearchInput className="flex-1" onSubmitText={(t) => _filter({ keyword: t, offset: 0 })} placeholder="Search address" onClear={(t) => _filter({ keyword: t, offset: 0 })} />
        {pageRole == SYS_PAGE_ROLE.ADMIN && (
          <>
            <TxButton label={selections?.length > 0 ? '선택자산회수' : '전체자산회수'} onClick={hdSweepAssets} />
          </>
        )}
      </TxForm>

      <TxAgGrid
        rowData={data?.data}
        option={tableOptions}
        isLoading={isLoading}
        defaultColDef={{ flex: 1 }}
        pagination={{
          currentPage: 1 + filter.offset / ITEMSIZE,
          totalRows: data?.total ?? 0,
          pageSize: ITEMSIZE,
          onChangePage: (page) => _filter({ offset: (page - 1) * ITEMSIZE }),
        }}
        onCellClicked={hdCellClicked}
        onSelectionChanged={hdSelectionChangeddddd}
      />
    </TxFlex>
  );
}
