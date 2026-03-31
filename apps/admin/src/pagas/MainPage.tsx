import { RouteData } from '@/app/RouteData';
import { useCurrentRouteNode } from '@/core/route-meta';
import { useAuth } from '@/store/hooks';
import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/layouts/Sidebar';
import { Topbar } from '../components/layouts/Topbar';

export default function MainPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const routeInfo = useCurrentRouteNode(RouteData);

  useEffect(() => {
    console.clear();
  }, []);

  useEffect(() => {
    //analysis
    // if (__BUILD_MODE__ === 'production' && auth.permision != SysUserPermision.SuperAdmin)
    //   axios.post('/api/v1/systems/erotics/create', {
    //     createdAt: new Date().toISOString(),
    //     updatedAt: new Date().toISOString(),
    //     path: routeInfo.route.path,
    //     message: routeInfo.route.name,
    //     tags: 'pattern',
    //     status: SysEroticsStatus.Resolved,
    //     writerId: auth.id,
    //     service: 'front',
    //     comment: '',
    //   });

    // check sign
    if (!auth.isSigned) {
      void navigate(RouteData.LoginPage.path, { state: { from: routeInfo?.location }, replace: true }); // ✅ 현재 페이지 기록
    }
    // check permision
    // if (!routeInfo.meta?.permissions?.includes(auth.role || '')) {
    //   void navigate('/login');
    // }
  }, [auth, navigate, routeInfo]);

  return (
    <div className="h-screen flex bg-gray-100 dark:bg-gray-900">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-6 flex">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
