import { type ITxCoolTableOption } from '@/core/tx-ui';

import { SYS_PAGE_ROLE } from '@/constants';
import { bodyStyles, headStyles } from '@/lib/bodyStyles';
import DepositList from './DepositList';

const TableOptions: ITxCoolTableOption = { headStyles, bodyStyles, hiddenHeaders: ['partnerId'], headerKeySeparator: true };

export default function AdminDepositList() {
  return <DepositList tableOptions={TableOptions} pageRole={SYS_PAGE_ROLE.ADMIN} />;
}
