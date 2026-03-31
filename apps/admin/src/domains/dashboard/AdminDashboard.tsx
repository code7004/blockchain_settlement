import { useEffect, useState } from 'react';

import { RouteData } from '@/app/RouteData';
import { useCurrentRouteNode } from '@/core/route-meta';
import { fetchAdminBalances, type IAdminBalance } from '../balance/balance.api';

export default function AdminDashboard() {
  const [data, _data] = useState<IAdminBalance>();
  const currentRoute = useCurrentRouteNode(RouteData.DeveloperPage.children);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetchAdminBalances();
      _data(res);
    };
    void fetchData();
  }, []);

  if (!data) return <div>Loading...</div>;

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

      {/* tx count */}
      {/* <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border rounded">
          <div className="text-sm">Withdrawals</div>
          <div className="text-xl font-semibold">{data.withdrawalSum.token.toLocaleString()} USDT</div>
        </div>
        <div className="p-4 border rounded">
          <div className="text-sm">Broadcasted Withdrawals</div>
          <div className="text-xl font-semibold">{data.broadcastedWithdrawals}</div>
        </div>
      </div> */}
    </div>
  );
}
