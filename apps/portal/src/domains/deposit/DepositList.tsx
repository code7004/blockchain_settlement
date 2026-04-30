import type { SYS_PAGE_ROLE } from '@/constants';
import { useStateForObject } from '@/core/hooks';
import { TxFlex, TxForm } from '@/core/tx-ui';
import type { ITxAgGridOption } from '@/core/tx-ui/TxAgGrid';
import TxAgGrid from '@/core/tx-ui/TxAgGrid/TxAgGrid';
import { usePartners } from '@/hooks';
import { useQuery } from '@tanstack/react-query';
import { apiGetDeposits } from './deposit.api';

const ITEMSIZE = 50;

export default function DepositList({ tableOptions, pageRole }: { pageRole: SYS_PAGE_ROLE; tableOptions: ITxAgGridOption }) {
  const [filter, _filter] = useStateForObject({ offset: 0, limit: ITEMSIZE, txHash: '' });

  const { partnerId, _partnerId, partners } = usePartners(pageRole);

  const { data, isLoading } = useQuery({
    queryKey: ['deposits', filter, partnerId],
    queryFn: async () => {
      if (!partnerId) return { data: [], total: 0 };
      const res = await apiGetDeposits({ partnerId, ...filter });
      return { data: res.data, total: res.total };
    },
    enabled: !!partnerId,
    staleTime: 1000 * 10,
    refetchInterval: 10000,
  });

  return (
    <TxFlex className="flex-1 flex-col">
      <TxForm className="mb-4 flex flex-row items-end justify-between gap-3">
        <TxForm.Dropdown caption="partner" value={partnerId} data={partners} onChangeText={(value) => void (_partnerId(value), _filter({ offset: 0 }))} />
        <TxForm.SearchInput className="flex-1" onSubmitText={(value) => _filter({ txHash: value, offset: 0 })} placeholder="Search txHash" onClear={(value) => _filter({ txHash: value, offset: 0 })} />
      </TxForm>

      <TxAgGrid
        rowData={data?.data}
        option={tableOptions}
        isLoading={isLoading}
        defaultColDef={{ flex: 1 }}
        offset={filter.offset}
        pagination={{
          currentPage: 1 + filter.offset / ITEMSIZE,
          totalRows: data?.total ?? 0,
          pageSize: ITEMSIZE,
          onChangePage: (page) => _filter({ offset: (page - 1) * ITEMSIZE }),
        }}
      />
    </TxFlex>
  );
}
