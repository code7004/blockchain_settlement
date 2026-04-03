import { RouteData } from '@/app/RouteData';
import { useCurrentRouteNode } from '@/core/route-meta';
import { TxLoading } from '@/core/tx-ui';
import { useQuery } from '@tanstack/react-query';
import { apiGetAdminBalances, type IAdminBalance } from '../balance/balance.api';

export default function PublicDashboard() {
  const currentRoute = useCurrentRouteNode(RouteData.DeveloperPage.children);

  const { data, isLoading } = useQuery<IAdminBalance>({
    queryKey: ['users'],
    queryFn: async () => await apiGetAdminBalances(),
    staleTime: 1000 * 10,
  });

  if (isLoading || !data) return <TxLoading className="flex-1 h-full" visible={true} />;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold">{currentRoute?.meta?.label}</h1>

      {/* total balance */}
      <div className="p-6 border rounded shadow">
        <div className=" text-sm">Total Balance</div>
        <div className="text-3xl font-bold text-end">{data.balance?.token.toLocaleString()} USDT</div>
      </div>

      {/* deposit / withdrawal */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border rounded ">
          <div className="text-sm ">Deposits</div>
          <div className="text-xl font-semibold text-end">{data.depositSum?.token.toLocaleString()} USDT</div>
        </div>
        <div className="p-4 border rounded">
          <div className="text-sm">Confirmed Deposits</div>
          <div className="text-xl font-semibold text-end">{data.confirmedDeposits} 개</div>
        </div>
      </div>
    </div>
  );
}
