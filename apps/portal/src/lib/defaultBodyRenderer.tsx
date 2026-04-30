/* eslint-disable @typescript-eslint/no-explicit-any */
import { TxJsonTree, type ITxCoolTableRenderBodyProps, type JsonValue } from '@/core/tx-ui';
import { TxTooltip } from '@/core/tx-ui/TxToolTip/TxToolTip';
import type { ColDef, ColGroupDef } from 'ag-grid-community';
import type { CustomCellRendererProps } from 'ag-grid-react';
import dayjs from 'dayjs';
import type { ReactNode } from 'react';

export function defaultBodyRenderer<T extends Record<string, any> = Record<string, unknown>, K extends string = never>(props: ITxCoolTableRenderBodyProps<T, K>): ReactNode {
  switch (props.key) {
    case 'user':
      return <TxTooltip tip={<TxJsonTree data={props.value as JsonValue} />}>{'{ ... }'}</TxTooltip>;

    case 'requestBody':
      try {
        const parsed = JSON.parse(props.value as string) as JsonValue;
        return <TxTooltip tip={<TxJsonTree data={parsed} />}>{'{ ... }'}</TxTooltip>;
      } catch {
        return props.value as ReactNode;
      }
    case 'assetsSnapshot':
      try {
        return <TxTooltip tip={<TxJsonTree data={props.value} />}>{'{ ... }'}</TxTooltip>;
      } catch {
        return props.value as ReactNode;
      }
    case 'amount':
      return props.value ? Number(props.value).toLocaleString() : 0;
    case 'txHash':
      return (
        <a href={`https://nile.tronscan.org/#/transaction/${props.value}`} target="_blank" className="text-blue-500 text-sm underline">
          {props.value}
        </a>
      );

    case 'createdAt':
    case 'apiKeyCreatedAt':
    case 'lastAttemptAt':
    case 'updatedAt':
    case 'confirmedAt':
    case 'detectedAt':
      return dayjs(props.value as string).format('YYYY-MM-DD HH:mm:ss');
    default:
      return props.value as ReactNode;
  }
}

export const basicColumnDefs: (ColDef<any, any> | ColGroupDef<any>)[] = [
  { field: 'createdAt', width: 150, valueFormatter: (params) => dayjs(params.value as string).format('YYYY-MM-DD HH:mm:ss') },
  { field: 'apiKeyCreatedAt', width: 150, valueFormatter: (params) => dayjs(params.value as string).format('YYYY-MM-DD HH:mm:ss') },
  { field: 'lastAttemptAt', width: 150, valueFormatter: (params) => dayjs(params.value as string).format('YYYY-MM-DD HH:mm:ss') },
  { field: 'detectedAt', width: 150, valueFormatter: (params) => dayjs(params.value as string).format('YYYY-MM-DD HH:mm:ss') },
  { field: 'confirmedAt', width: 150, valueFormatter: (params) => dayjs(params.value as string).format('YYYY-MM-DD HH:mm:ss') },
  { field: 'updatedAt', width: 150, valueFormatter: (params) => dayjs(params.value as string).format('YYYY-MM-DD HH:mm:ss') },
];

export const customColumnDefs: (ColDef<any, any> | ColGroupDef<any>)[] = [
  ...basicColumnDefs,
  { field: 'id', width: 150 },
  { field: 'username', width: 150 },
  { field: 'userId', width: 150 },
  { field: 'walletId', width: 150 },
  { field: 'tokenSymbol', width: 100, cellClass: 'text-center' },
  { field: 'isActive', width: 60, cellClass: 'text-center', headerName: 'Active' },
  { field: 'tokenContract' },
  {
    field: 'txHash',
    cellRenderer: (params: CustomCellRendererProps) => (
      <a href={`https://nile.tronscan.org/#/transaction/${params.value}`} target="_blank" className="text-blue-500 text-sm underline">
        {params.value}
      </a>
    ),
  },
  { field: 'callbackSecret', width: 120 },
  { field: 'apiKeyPrefix', width: 120 },
  { field: 'fromAddress' },
  { field: 'toAddress' },
  { field: 'amount', width: 100, cellClass: 'text-end !pr-4', valueFormatter: (params) => Number(params.value).toLocaleString() },
  { field: 'blockNumber', width: 100, cellClass: 'text-end !pr-4' },
  { field: 'status', width: 100, cellClass: 'text-center' },
  { field: 'reason' },
  { field: 'writer', width: 100 },
];

/* eslint-enable @typescript-eslint/no-explicit-any */
