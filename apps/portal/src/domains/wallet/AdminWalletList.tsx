import { type ITxCoolTableOption } from '@/core/tx-ui';

import { SYS_PAGE_ROLE } from '@/constants';
import { bodyStyles, headStyles } from '@/lib/bodyStyles';
import WalletList from './WalletList';

const TableOptions: ITxCoolTableOption = { headStyles, bodyStyles, headers: ['IDX', 'id', 'user.externalUserId', 'address', 'userId', 'status', 'createdAt', 'updatedAt'], headerKeySeparator: true };

export default function AdminWalletList() {
  return <WalletList tableOptions={TableOptions} pageRole={SYS_PAGE_ROLE.ADMIN} />;
}
