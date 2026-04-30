import { SYS_PAGE_ROLE } from '@/constants';
import { useStateForObject } from '@/core/hooks';
import { TxAgGrid, TxFlex, TxForm, TxSearchInput, type ITxAgGridOption } from '@/core/tx-ui';
import { usePartners } from '@/hooks';
import { useQuery } from '@tanstack/react-query';
import { SweepStatus, apiGetSweeps, type GetSweepQueryDto, type SweepDto } from './sweep.api';

const ITEMSIZE = 50;
const Status = Object.values(SweepStatus);

export default function SweepList({ tableOptions, pageRole }: { pageRole: SYS_PAGE_ROLE; tableOptions: ITxAgGridOption }) {
  const [filter, _filter] = useStateForObject<{ offset: number } & GetSweepQueryDto>({ offset: 0, limit: ITEMSIZE, id: '', partnerId: '', status: undefined });
  const { partnerId, _partnerId, partners } = usePartners(pageRole);

  const { data, isLoading } = useQuery({
    queryKey: ['sweeps', filter, partnerId],
    queryFn: async () => {
      if (!partnerId) return { data: [], total: 0 };
      const res = await apiGetSweeps({ ...filter, partnerId });
      return { data: (res.data?.map((e, idx) => ({ IDX: filter.offset + idx + 1, ...e })) as SweepDto[]) ?? [], total: res.total };
    },
    enabled: !!partnerId, // block condition
    staleTime: 1000 * 10,
    refetchInterval: 10000,
  });

  return (
    <TxFlex className="flex flex-1 flex-col">
      <TxForm className="flex flex-row items-end justify-between gap-3 mb-4">
        <TxForm.Dropdown caption="partner" value={partnerId} data={partners} onChangeText={(t) => void (_partnerId(t), _filter({ offset: 0 }))} />
        <TxForm.Dropdown caption="status" data={Status} onChangeValue={(t) => _filter({ status: t.value as SweepStatus, offset: 0 })} addNoChoiceItem />
        <TxSearchInput className="flex-1" onSubmitText={(t) => _filter({ id: t, offset: 0 })} placeholder="Search id" onClear={(t) => _filter({ id: t, offset: 0 })} />
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
