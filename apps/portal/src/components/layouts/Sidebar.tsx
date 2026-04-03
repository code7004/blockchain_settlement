import { RouteData } from '@/app/RouteData';
import { getNavigableRoutes } from '@/core/route-meta';
import { TxTabs } from '@/core/tx-ui';
import { MemberRole } from '@/domains/member/member.api';
import type { IStateAuth } from '@/store/auth';
import { useAuth } from '@/store/hooks';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarItem } from './SidebarItem';

export function Sidebar() {
  const auth = useAuth();
  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-md p-4 overflow-y-auto min-w-44">
      <h1 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">{import.meta.env.VITE_APP_NAME}</h1>
      {auth.role == MemberRole.DEVELOPER ? <PublicSidebar auth={auth} /> : <AdminSidebar auth={auth} />}
    </aside>
  );
}

export function AdminSidebar({ auth }: { auth: IStateAuth }) {
  const [tabIdx, setTabIdx] = useState(1);
  const navigate = useNavigate();

  const routes = getNavigableRoutes(tabIdx == 0 ? RouteData.DeveloperPage.children : RouteData.AdminPage.children, auth.role as string);

  function hdChangeTab(tab: number) {
    setTabIdx(tab);
    void navigate(tab == 0 ? RouteData.DeveloperPage.path : RouteData.AdminPage.path);
  }
  return (
    <>
      <TxTabs tabs={['Developer', 'Admin']} className="mb-1" value={tabIdx} onChange={hdChangeTab} />
      {Object.values(routes).map((menu) => (
        <SidebarItem key={menu.path ?? menu.meta?.label} item={menu} autoOpenDepth={2} />
      ))}
    </>
  );
}

export function PublicSidebar({ auth }: { auth: IStateAuth }) {
  const routes = getNavigableRoutes(RouteData.DeveloperPage.children, auth.role as string);
  return (
    <>
      {Object.values(routes).map((menu) => (
        <SidebarItem key={menu.path ?? menu.meta?.label} item={menu} autoOpenDepth={2} />
      ))}
    </>
  );
}
