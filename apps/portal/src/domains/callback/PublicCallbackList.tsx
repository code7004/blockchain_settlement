import { type ITxAgGridOption } from '@/core/tx-ui';

import { SYS_PAGE_ROLE } from '@/constants';
import { customColumnDefs } from '@/lib/defaultBodyRenderer';
import CallbackList from './CallbackList';

const TableOptions: ITxAgGridOption = {
  headers: ['id', 'txHash', 'callbackUrl', 'lastStatusCode', 'status', 'reason', 'requestBody', 'attemptCount', 'maxAttempts', 'lastAttemptAt', 'requestSignature', 'depositId', 'writer', 'createdAt', 'updatedAt'],
  editColumns: ['callbackUrl'],
  customColumnDefs,
  rowSelection: { mode: 'multiRow' },
};

export default function PublicCallbackList() {
  return <CallbackList tableOptions={TableOptions} pageRole={SYS_PAGE_ROLE.PUBLIC} />;
}
