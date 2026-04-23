import { type ITxCoolTableOption } from '@/core/tx-ui';

import { SYS_PAGE_ROLE } from '@/constants';
import { bodyStyles, headStyles } from '@/lib/bodyStyles';
import SweepList from './SweepList';

const TableOptions: ITxCoolTableOption = {
  headStyles,
  bodyStyles,
  headers: ['IDX', 'id', 'partnerId', 'depositId', 'txHash', 'fromAddress', 'toAddress', 'amount', 'feeAmount', 'feeSymbol', 'status', 'reason', 'errorMessage', 'writer', 'createdAt'],
};

export default function AdminSweepList() {
  return <SweepList tableOptions={TableOptions} pageRole={SYS_PAGE_ROLE.ADMIN} />;
}
