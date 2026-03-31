import { type ITxCoolTableOption } from '@/core/tx-ui';

import { SYS_PAGE_ROLE } from '@/constants';
import { bodyStyles, headStyles } from '@/lib/bodyStyles';
import CallbackList from './CallbackList';

const TableOptions: ITxCoolTableOption = {
  headStyles,
  bodyStyles,
  headers: ['IDX', 'id', 'txHash', 'lastStatusCode', 'status', 'requestBody', 'attemptCount', 'maxAttempts', 'lastAttemptAt', 'callbackUrl', 'requestSignature', 'depositId', 'createdAt', 'updatedAt'],
  headerKeySeparator: true,
};

export default function PublicCallbackList() {
  return <CallbackList tableOptions={TableOptions} pageRole={SYS_PAGE_ROLE.PUBLIC} />;
}
