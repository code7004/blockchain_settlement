import { useMemo, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { TxDropMenuTheme, type ITxDropMenuItemProps, type ITxDropMenuLinkItemProps, type ITxDropMenuProps } from '.';
import { cm, themeMerge } from '..';

/**
 * TxDropMenu
 * - GNB/프로필 드롭다운 패널
 */
export const TxDropMenu = ({ label, children, theme, trigger = 'hover', direction = 'vertical' }: ITxDropMenuProps) => {
  const stableTheme = useMemo(() => themeMerge(TxDropMenuTheme, theme, 'override'), [theme]);
  const [open, _open] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const hdMouseEnter = () => trigger === 'hover' && _open(true);
  const hdMouseLeave = () => trigger === 'hover' && _open(false);
  const hdClick = () => trigger === 'click' && _open((v) => !v);

  return (
    <div data-tag="TxDropMenu" ref={ref} className={stableTheme.wrapper} onMouseEnter={hdMouseEnter} onMouseLeave={hdMouseLeave}>
      <div className={stableTheme.label} onClick={hdClick}>
        {label}
      </div>
      {open && <div className={cm(stableTheme.panel, direction === 'vertical' ? 'flex flex-col' : 'flex flex-row')}>{children}</div>}
    </div>
  );
};

// 👉 기본 Item
const Item = ({ children, className, ...props }: ITxDropMenuItemProps) => (
  <div data-tag="TxDropMenu.Item" className={cm(TxDropMenuTheme.item, className)} {...props}>
    {children}
  </div>
);

const LinkItem = ({ to, children, className }: ITxDropMenuLinkItemProps) => (
  <NavLink to={to} className={({ isActive }) => cm(TxDropMenuTheme.item, className, isActive && 'font-semibold underline')}>
    {children}
  </NavLink>
);

const Divider = () => <div data-tag="TxDropMenu.Divider" className="my-1 border-t border-gray-200 dark:border-gray-700" />;

TxDropMenu.Item = Item;
TxDropMenu.LinkItem = LinkItem;
TxDropMenu.Divider = Divider;
