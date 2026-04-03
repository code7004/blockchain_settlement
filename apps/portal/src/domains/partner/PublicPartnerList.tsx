import { SYS_PAGE_ROLE } from '@/constants';
import type { ITxCoolTableOption } from '@/core/tx-ui';
import { bodyStyles, headStyles } from '@/lib/bodyStyles';
import PartnerList from './PartnerList';

const TableOptions: ITxCoolTableOption = {
  headStyles,
  bodyStyles,
  editColumns: ['callbackUrl', 'name', 'callbackSecret'],
  addHeaders: ['key-reset'],
  hiddenHeaders: ['apiKeyHash', 'memberId'],
};

export default function PublicPartnerList() {
  return <PartnerList pageRole={SYS_PAGE_ROLE.PUBLIC} tableOptions={TableOptions} />;
}
