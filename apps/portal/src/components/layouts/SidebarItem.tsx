import type { RouteNode } from '@/core/route-meta';
import { useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

interface SidebarItemProps {
  item: RouteNode;
  depthCursor?: number;
  autoOpenDepth: number;
}

export function SidebarItem({ item, depthCursor = 1, autoOpenDepth: autoOpenDepth = 1 }: SidebarItemProps) {
  const location = useLocation();

  const children = useMemo(() => item.children ?? {}, [item.children]);
  const hasChildren = Object.keys(children).length > 0;

  const isActiveBranch = useMemo(() => {
    if (!hasChildren) return false;
    return Object.values(children).some((child) => child.path && location.pathname.startsWith(child.path));
  }, [children, location.pathname, hasChildren]);

  const [open, setOpen] = useState(depthCursor < autoOpenDepth || isActiveBranch);

  // depth 스타일
  const basePadding = 12 + depthCursor * 12;

  // 공통 스타일
  const baseItem = 'flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors cursor-pointer';
  const textColor = 'text-gray-700 dark:text-gray-300';
  const hover = 'hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-white';

  // 👉 open 상태 스타일 (핵심)
  const openStyle = open ? 'bg-gray-100 text-gray-900 dark:bg-gray-700/40 dark:text-white' : '';

  if (hasChildren) {
    return (
      <div className="mb-1">
        <div onClick={() => setOpen((prev) => !prev)} style={{ paddingLeft: basePadding }} className={`${baseItem} ${textColor} ${hover} ${openStyle}`}>
          <span className="truncate">{item.meta?.label}</span>

          {/* arrow */}
          <span className={`text-xs transition-transform ${open ? 'rotate-90 text-gray-700 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>▶</span>
        </div>

        {/* children */}
        <div className={`overflow-hidden transition-all duration-200 ${open ? 'max-h-125 opacity-100' : 'max-h-0 opacity-0'}`}>
          {Object.values(children).map((child) => (
            <SidebarItem key={child.path ?? child.meta?.label} item={child} depthCursor={depthCursor + 1} autoOpenDepth={autoOpenDepth} />
          ))}
        </div>
      </div>
    );
  }

  function hdClickLink(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>): void {
    if (item.meta?.onClick) {
      e.preventDefault();
      item.meta.onClick();
    }
  }

  return (
    <NavLink to={item.path ?? ''} onClick={hdClickLink} style={{ paddingLeft: basePadding }} className={({ isActive }) => `${baseItem} ${isActive ? 'bg-blue-600 text-white' : `${textColor} ${hover}`}`}>
      {item.meta?.label}
    </NavLink>
  );
}
