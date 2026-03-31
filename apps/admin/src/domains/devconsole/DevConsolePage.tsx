import { TxDropdownPatners } from '@/components/TxDropdownPartners';
import { CallbackStatus, SERVER_TYPE, SYS_PAGE_ROLE } from '@/constants';
import { useSafePolling, useStateForObject } from '@/core/hooks';
import { parseApiError } from '@/core/network';
import { TxButton, TxFieldDropdown, TxFieldInput, type ITxDropdownItem } from '@/core/tx-ui';
import { useConfig } from '@/store/hooks';
import { useEffect, useState } from 'react';
import { getAdminWallets } from '../wallet/wallet.api';
import { getAdminBlockChainTxHashMonitor, getAdminBlockChainWalletBalance, postAdminBlockChainTestTransfer, type IGetAdminBlockChainTxHashMonitor, type IGetAdminBlockChainWalletBalance } from './devconsole.api';

export default function DevConsolePage() {
  const config = useConfig();
  const [wallets, setWallets] = useState<ITxDropdownItem[]>([]);
  const [walletBalance, setWalletBalance] = useState<IGetAdminBlockChainWalletBalance>();
  const [eMessage, _eMessage] = useState<Record<string, string>>({});
  const [partnerId, _partnerId] = useState<string>();

  const [txHash, _txHash] = useState<string>();
  const [txProcess, _txProcess] = useState<IGetAdminBlockChainTxHashMonitor>();

  const [form, setForm] = useStateForObject({
    fromPrivateKey: config.server === SERVER_TYPE.TEST ? ((import.meta.env.VITE_SENDER_WALLET_PRIVATE_KEY as string) ?? '') : '',
    toAddress: '',
    amount: 0.1,
    tokenSymbol: config.server === SERVER_TYPE.TEST ? 'mUSDT' : 'USDT',
  });

  useEffect(() => {
    void (async () => {
      if (!partnerId) return;
      const res = await getAdminWallets({ limit: 20, partnerId });
      setWallets(res.data.map((e) => ({ value: e.address, name: `${e.user.externalUserId}: ${e.address}` })));
    })();
  }, [partnerId]);

  async function hdFetchWalletBalance() {
    const res = await getAdminBlockChainWalletBalance(import.meta.env.VITE_SENDER_WALLET_ADDRESS as string);
    setWalletBalance(res.data);
  }
  async function hdSend() {
    try {
      const res = await postAdminBlockChainTestTransfer(form);
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
    const res = await getAdminBlockChainTxHashMonitor(txHash);
    _txProcess(res);
    if (res.steps?.[3]?.status == CallbackStatus.FAILED || res.steps?.[3]?.status == CallbackStatus.SUCCESS) pol.stop();
    console.log(res);
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
      <TxDropdownPatners className="w-full" onChangeText={_partnerId} pageRole={SYS_PAGE_ROLE.PUBLIC} />
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
            {txProcess?.steps.map((e, idx) => (
              <div key={idx}>{`${e.step}: ${e.success} ${idx + 1 != txProcess?.steps.length ? ' → ' : ''}`}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
