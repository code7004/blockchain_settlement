import { SYS_PAGE_ROLE } from '@/constants';
import { type ITxAgGridColumnDef, type ITxAgGridOption } from '@/core/tx-ui';
import { customColumnDefs } from '@/lib/defaultBodyRenderer';
import type { CustomCellRendererProps } from 'ag-grid-react';
import PartnerList from './PartnerList';

const overDefs: ITxAgGridColumnDef = [{ field: 'key-reset', cellRenderer: (params: CustomCellRendererProps) => <div className="underline cursor-pointer">RESET API KEY{params.value}</div> }];

const TableOptions: ITxAgGridOption = {
  customColumnDefs: [...customColumnDefs, ...overDefs],
  editColumns: ['callbackUrl', 'name', 'callbackSecret', 'isActive'],
  addHeaders: ['key-reset'],
  hiddenHeaders: ['apiKeyHash', 'memberId'],
};

export default function PublicPartnerList() {
  return <PartnerList pageRole={SYS_PAGE_ROLE.PUBLIC} tableOptions={TableOptions} />;
}
