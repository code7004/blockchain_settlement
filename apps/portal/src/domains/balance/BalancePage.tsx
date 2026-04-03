import { RouteData } from '@/app/RouteData';
import { useCurrentRouteNode } from '@/core/route-meta';

export default function Dashboard() {
  const currentRoute = useCurrentRouteNode(RouteData.DeveloperPage.children);

  return <div className="flex flex-1 text-4xl">{currentRoute?.meta?.label} </div>;
}
