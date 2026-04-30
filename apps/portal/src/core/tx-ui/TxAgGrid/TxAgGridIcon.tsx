import type { CustomInnerHeaderProps } from 'ag-grid-react';

export interface MyCustomInnerHeaderProps extends CustomInnerHeaderProps {
  icon: string;
}

export function TxAgGridIconEdit(props: MyCustomInnerHeaderProps) {
  return <div className="customInnerHeader">✏️{props.displayName}</div>;
}
