import { SYS_PAGE_ROLE } from '@/constants';
import type { ITxAgGridOption } from '@/core/tx-ui';
import { customColumnDefs } from '@/lib/defaultBodyRenderer';
import UserList from './UserList';

const TableOptions: ITxAgGridOption = {
  customColumnDefs: customColumnDefs,
  editColumns: ['isActive'],
  addHeaders: [],
  hiddenHeaders: [],
};

export default function PublicUserList() {
  return <UserList pageRole={SYS_PAGE_ROLE.PUBLIC} tableOptions={TableOptions} />;
}
