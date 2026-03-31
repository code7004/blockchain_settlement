import { SYS_PAGE_ROLE } from '@/constants';
import type { ITxCoolTableOption } from '@/core/tx-ui';
import { bodyStyles, headStyles } from '@/lib/bodyStyles';
import UserList from './UserList';

const TableOptions: ITxCoolTableOption = {
  headStyles,
  bodyStyles,
  editColumns: [],
  addHeaders: [],
  hiddenHeaders: [],
};

export default function PublicUserList() {
  return <UserList pageRole={SYS_PAGE_ROLE.PUBLIC} tableOptions={TableOptions} />;
}
