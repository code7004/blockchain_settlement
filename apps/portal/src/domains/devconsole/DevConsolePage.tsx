import { SERVER_TYPE, SYS_PAGE_ROLE } from '@/constants';
import { useSafePolling, useStateForObject } from '@/core/hooks';
import { parseApiError } from '@/core/network';
import { TxButton, TxDropdown, TxFieldDropdown, TxFieldInput } from '@/core/tx-ui';
import { usePartners } from '@/hooks';
import { useConfig } from '@/store/hooks';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { CallbackStatus } from '../callback/callback.api';
import { apiGetWallets } from '../wallet/wallet.api';
import { apiGetAdminBlockChainTxHashMonitor, apiGetBlockChainWalletBalance, apiPostAdminBlockChainTestTransfer, type IGetAdminBlockChainTxHashMonitor, type IGetAdminBlockChainWalletBalance } from './devconsole.api';

export default function DevConsolePage() {
  const config = useConfig();
  const [walletBalance, setWalletBalance] = useState<IGetAdminBlockChainWalletBalance>();
  const [eMessage, _eMessage] = useState<Record<string, string>>({});

  const { partnerId, _partnerId, partners } = usePartners(SYS_PAGE_ROLE.PUBLIC);

  const [txHash, _txHash] = useState<string>();
  const [txProcess, _txProcess] = useState<IGetAdminBlockChainTxHashMonitor>();

  const [form, setForm] = useStateForObject({
    fromPrivateKey: config.server === SERVER_TYPE.TEST ? ((import.meta.env.VITE_SENDER_WALLET_PRIVATE_KEY as string) ?? '') : '',
    toAddress: '',
    amount: 0.01,
    tokenSymbol: config.server === SERVER_TYPE.TEST ? import.meta.env.VITE_TOKEN_SYMBOL : 'USDT',
  });

  const { data: wallets } = useQuery({
    queryKey: ['devConsole', partnerId],
    queryFn: async () => {
      if (!partnerId) return [];
      const res = await apiGetWallets({ limit: 20, partnerId });
      return res.data.map((e) => ({ value: e.address, name: `${e.user.externalUserId}: ${e.address}` })) || [];
    },
    enabled: !!partnerId, // block condition
    staleTime: 1000 * 60,
  });

  async function hdFetchWalletBalance() {
    const res = await apiGetBlockChainWalletBalance(import.meta.env.VITE_SENDER_WALLET_ADDRESS as string);
    setWalletBalance(res.data);
  }
  async function hdSend() {
    try {
      const res = await apiPostAdminBlockChainTestTransfer(form);
      _txHash(res.data.txHash);
      _txProcess(undefined);
      pol.start();
    } catch (err) {
      const e = parseApiError(err);
      if (e.message.includes('address')) _eMessage({ address: e.message });
      else if (e.message.includes('privateKey')) _eMessage({ privateKey: e.message });
      else _eMessage({ error: e.message });
    }
  }

  const pol = useSafePolling(fetchMonitor, 2000);

  async function fetchMonitor() {
    if (!txHash) return;
    const res = await apiGetAdminBlockChainTxHashMonitor(txHash);
    _txProcess(res);
    if (res.steps?.[3]?.status == CallbackStatus.FAILED || res.steps?.[3]?.status == CallbackStatus.SUCCESS) pol.stop();
  }

  return (
    <div className="flex flex-1 flex-col p-6 max-w-5xl space-y-8">
      <h1 className="text-lg font-semibold">Test Console</h1>
      <ol className="text-sm">
        <li>
          * 본 콘솔은 {config.server === SERVER_TYPE.TEST ? 'Test' : 'Main'} Net {config.server === SERVER_TYPE.TEST ? 'mUSDT' : 'USDT'} 전용입니다.
        </li>
        <li>* 본 거래는 {config.server === SERVER_TYPE.LIVE ? 'Test' : 'Main'} Net 에서는 감지 할 수 없습니다. .</li>
        <li>* TRX가 없는 경우 Token 전송이 되지 않습니다.</li>
        {config.server === SERVER_TYPE.TEST && (
          <li>
            <a href="https://nileex.io/join/getJoinPage" target={'_blank'} className="underline pl-4">
              https://nileex.io/join/getJoinPage 에서
            </a>
            "{import.meta.env.VITE_SENDER_WALLET_ADDRESS}" 에 test coin을 충전 가능 합니다.
          </li>
        )}
      </ol>

      <div className="flex gap-2">
        TRX: {walletBalance?.trx}, TOKEN: {walletBalance?.token} {form.tokenSymbol}
      </div>
      {/* Private Key */}
      <div className="flex gap-2">
        <TxFieldInput
          caption="From Address private key"
          type="password"
          className="flex-1"
          placeholder="From Private Key"
          value={form.fromPrivateKey}
          warning={config.server === SERVER_TYPE.TEST ? '본 private key는 test net 전용 account 입니다.' : ''}
        />
        <TxButton label="잔액조회" onClick={hdFetchWalletBalance} />
      </div>

      <TxDropdown value={partnerId} data={partners} onChangeText={_partnerId} />
      {/* To Address */}
      <TxFieldDropdown caption="To Address" className="w-full" data={wallets} value={form.toAddress} onChangeText={(t) => setForm({ toAddress: t })} error={eMessage.address} />
      {/* Token */}
      <TxFieldInput caption="Contract symbol" readOnly className="w-full" value={form.tokenSymbol} onChangeText={(t) => setForm({ tokenSymbol: t })} />
      {/* Amount */}
      <TxFieldInput caption="Amount(Token)" className="w-full text-end" type="number" step="0.1" min="0.1" placeholder="Amount" value={form.amount} onChangeNumber={(amount) => setForm({ amount })} />
      {/* Send */}
      <TxButton onClick={hdSend} label="Send" />
      {eMessage?.error && <div>{eMessage.error}</div>}

      {/* Result */}
      {txHash && (
        <div className="p-3 border rounded space-y-2">
          <div className="text-sm">txHash:</div>
          <div className="text-xs break-all">{txHash}</div>

          <div className="flex justify-between">
            <a href={`https://nile.tronscan.org/#/transaction/${txHash}`} target="_blank" className="text-blue-500 text-sm">
              View on Tronscan
            </a>

            <TxButton label="process refresh" variant="text" className="text-blue-500 text-sm" onClick={() => pol.start()} />
          </div>
          <div className="flex gap-4">
            {txProcess?.steps && txProcess?.steps.length < 1 && <div className="animate-pulse">Detecting...</div>}
            {txProcess?.steps.map((e, idx) => {
              if (e.success) return <div key={idx} className={txProcess?.steps[3]?.success ? '' : 'animate-pulse'}>{`${e.step} ${idx + 1 != txProcess?.steps.length ? ' → ' : ''}`}</div>;
            })}

            {txProcess?.steps && txProcess?.steps.length > 3 && <div>{txProcess.steps[3].status}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
