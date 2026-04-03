import type { TxDropMenuTheme } from '.';
import type { DeepPartial } from '..';

export interface ITxDropMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface ITxDropMenuProps {
  label: React.ReactNode;
  children: React.ReactNode;
  theme?: DeepPartial<typeof TxDropMenuTheme>;
  trigger?: 'hover' | 'click';
  direction?: 'vertical' | 'horizontal'; // ✅ 기본 vertical
}
// 👉 NavLink 전용 Sugar Item
export interface ITxDropMenuLinkItemProps {
  to: string;
  children: React.ReactNode;
  className?: string;
}
