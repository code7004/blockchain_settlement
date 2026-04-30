import { RouteData } from '@/app/RouteData';
import { useCurrentRouteNode } from '@/core/route-meta';
import { TxLoading } from '@/core/tx-ui';
import TxAgGrid from '@/core/tx-ui/TxAgGrid/TxAgGrid';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { apiGetAdminBalances, type IAdminBalance } from '../balance/balance.api';

export default function AdminDashboard() {
  const currentRoute = useCurrentRouteNode(RouteData.DeveloperPage.children);

  const { data, isLoading } = useQuery<IAdminBalance>({
    queryKey: ['users'],
    queryFn: async () => await apiGetAdminBalances(),
    staleTime: 1000 * 10,
  });
  // Row Data: The data to be displayed.
  const [rowData] = useState(Array.from({ length: 100 }).map((_, i) => ({ make: 'Tesla' + i, model: 'Model Y', price: 64950, electric: true, korea: 'dkdkdkdkdkdkdk' })));

  if (isLoading || !data) return <TxLoading className="flex-1 h-full" visible={true} />;

  return (
    <div className="p-6 space-y-6 flex flex-1 flex-col">
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

      {/* Data Grid will fill the size of the parent container */}
      <div className="flex-1">
        <TxAgGrid rowData={rowData} defaultColDef={{ flex: 1 }} />
      </div>
    </div>
  );
}
