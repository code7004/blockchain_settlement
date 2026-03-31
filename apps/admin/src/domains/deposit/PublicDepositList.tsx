import { type ITxCoolTableOption } from '@/core/tx-ui';

import { SYS_PAGE_ROLE } from '@/constants';
import { bodyStyles, headStyles } from '@/lib/bodyStyles';
import DepositList from './DepositList';

const TableOptions: ITxCoolTableOption = { headStyles, bodyStyles, hiddenHeaders: ['tokenContract', 'userId', 'partnerId', 'id', 'blockNumber', 'tokenSymbol'], headerKeySeparator: true };

export default function PublicDepositList() {
  return <DepositList tableOptions={TableOptions} pageRole={SYS_PAGE_ROLE.PUBLIC} />;
}
