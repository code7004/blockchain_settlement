import { type ITxAgGridOption } from '@/core/tx-ui';

import { SYS_PAGE_ROLE } from '@/constants';
import { customColumnDefs } from '@/lib/defaultBodyRenderer';
import SweepList from './SweepList';

const TableOptions: ITxAgGridOption = {
  headers: ['id', 'partnerId', 'depositId', 'txHash', 'fromAddress', 'toAddress', 'amount', 'feeAmount', 'feeSymbol', 'status', 'reason', 'errorMessage', 'writer', 'createdAt'],
  customColumnDefs,
};

export default function PublicSweepList() {
  return <SweepList tableOptions={TableOptions} pageRole={SYS_PAGE_ROLE.PUBLIC} />;
}
