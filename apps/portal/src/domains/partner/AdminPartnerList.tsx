import { SYS_PAGE_ROLE } from '@/constants';
import type { ITxCoolTableOption } from '@/core/tx-ui';
import { bodyStyles, headStyles } from '@/lib/bodyStyles';
import PartnerList from './PartnerList';

const TableOptions: ITxCoolTableOption = {
  headStyles,
  bodyStyles,
  editColumns: ['callbackUrl', 'name', 'callbackSecret'],
};

export default function AdminPartnerList() {
  return <PartnerList pageRole={SYS_PAGE_ROLE.ADMIN} tableOptions={TableOptions} />;
}
