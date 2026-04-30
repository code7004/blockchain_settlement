import { SYS_PAGE_ROLE } from '@/constants';
import { mergeColumnDefs, type ITxAgGridColumnDef, type ITxAgGridOption } from '@/core/tx-ui/TxAgGrid';
import { customColumnDefs } from '@/lib/defaultBodyRenderer';
import DepositList from './DepositList';
import type { DepositDto } from './deposit.api';

const overDefs: ITxAgGridColumnDef<DepositDto> = [{ field: 'amount', width: 100, cellClass: 'text-end !pr-4', valueFormatter: (params) => Number(params.value / 1000000).toLocaleString() + ' USDT' }];

const TableOptions: ITxAgGridOption = {
  customColumnDefs: mergeColumnDefs(customColumnDefs, overDefs),
  hiddenHeaders: ['partnerId'],
};

export default function AdminDepositList() {
  return <DepositList tableOptions={TableOptions} pageRole={SYS_PAGE_ROLE.ADMIN} />;
}
