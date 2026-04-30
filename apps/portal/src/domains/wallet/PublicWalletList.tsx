import { SYS_PAGE_ROLE } from '@/constants';
import type { ITxAgGridOption } from '@/core/tx-ui';
import { customColumnDefs } from '@/lib/defaultBodyRenderer';
import type { CustomCellRendererProps } from 'ag-grid-react';
import WalletList from './WalletList';

const TableOptions: ITxAgGridOption = {
  headers: ['id', 'user.externalUserId', 'address', 'userId', 'status', 'assetsSnapshot', 'createdAt', 'updatedAt', 'refetch'],
  customColumnDefs: [
    ...customColumnDefs,
    { field: 'user.externalUserId', headerName: 'User Id' },
    {
      field: 'assetsSnapshot',
      valueFormatter: (params) => `trx: ${params.value?.coins?.trx}, ${import.meta.env.VITE_TOKEN_SYMBOL}: ${params.value?.tokens?.[import.meta.env.VITE_TOKEN_SYMBOL]}`,
    },
    { field: 'refetch', cellRenderer: (params: CustomCellRendererProps) => <div className="underline cursor-pointer">자산조회{params.value}</div> },
  ],
  rowSelection: {
    mode: 'multiRow',
  },
};
export default function PublicWalletList() {
  return <WalletList tableOptions={TableOptions} pageRole={SYS_PAGE_ROLE.PUBLIC} />;
}
