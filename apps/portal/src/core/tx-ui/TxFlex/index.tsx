import React from 'react';

import { cm } from '..';
export const TxFlex = ({ className = 'gap-2', ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return <div data-tag="TxFlex" className={cm('flex', className)} {...props}></div>;
};
