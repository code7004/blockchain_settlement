import type { ReactNode } from 'react';
import type { TxCardTheme } from '.';
import type { DeepPartial } from '..';

export interface ITxCardProps {
  caption?: string;
  header?: string;
  footer?: string;
  children?: ReactNode;
  useFold?: boolean;
  isFold?: boolean;
  className?: string;
  theme?: DeepPartial<typeof TxCardTheme>;
  link?: string;
  onClick?: () => void;
  isLoading?: boolean | unknown[];
}
