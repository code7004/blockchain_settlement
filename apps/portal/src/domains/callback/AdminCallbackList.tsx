import { type ITxCoolTableOption } from '@/core/tx-ui';

import { SYS_PAGE_ROLE } from '@/constants';
import { bodyStyles, headStyles } from '@/lib/bodyStyles';
import CallbackList from './CallbackList';

const TableOptions: ITxCoolTableOption = {
  headStyles,
  bodyStyles,
  headers: ['IDX', 'id', 'txHash', 'callbackUrl', 'lastStatusCode', 'status', 'reason', 'requestBody', 'attemptCount', 'maxAttempts', 'lastAttemptAt', 'requestSignature', 'depositId', 'writer', 'createdAt', 'updatedAt'],
  headerKeySeparator: true,
};

export default function AdminCallbackList() {
  return <CallbackList tableOptions={TableOptions} pageRole={SYS_PAGE_ROLE.ADMIN} />;
}
