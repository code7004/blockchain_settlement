/* eslint-disable @typescript-eslint/no-explicit-any */
import { TxJsonTree, type ITxCoolTableRenderBodyProps, type JsonValue } from '@/core/tx-ui';
import { TxTooltip } from '@/core/tx-ui/TxToolTip/TxToolTip';
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

/* eslint-enable @typescript-eslint/no-explicit-any */
