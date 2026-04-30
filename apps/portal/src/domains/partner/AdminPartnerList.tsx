import { SYS_PAGE_ROLE } from '@/constants';
import type { ITxAgGridOption } from '@/core/tx-ui';
import { customColumnDefs } from '@/lib/defaultBodyRenderer';
import PartnerList from './PartnerList';

const TableOptions: ITxAgGridOption = {
  customColumnDefs: customColumnDefs,
  editColumns: ['callbackUrl', 'name', 'callbackSecret', 'isActive'],
};

export default function AdminPartnerList() {
  return <PartnerList pageRole={SYS_PAGE_ROLE.ADMIN} tableOptions={TableOptions} />;
}
