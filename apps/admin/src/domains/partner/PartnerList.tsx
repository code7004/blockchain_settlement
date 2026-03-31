import { SYS_PAGE_ROLE } from '@/constants';
import { useStateForObject } from '@/core/hooks';
import { parseApiError } from '@/core/network';
import { TxButton, TxCoolTable, TxCoolTablePagination, TxCoolTableScroller, TxFieldInput, TxLoading, TxModal, copyToClipboard, type ITxCoolTableChangeCellEvent, type ITxCoolTableOption, type ITxCoolTableRenderBodyProps } from '@/core/tx-ui';
import { defaultBodyRenderer } from '@/lib/defaultBodyRenderer';
import { useAuth, useConfig } from '@/store/hooks';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { getAdminPartners, patchAdminPartner, postAdminPartner, postAdminPartnerApiKeyReset, removeAdminPartners, type IPartner } from './partner.api';

const ITEMSIZE = 50;

export default function AdminPartnerList({ pageRole, tableOptions }: { pageRole: SYS_PAGE_ROLE; tableOptions: ITxCoolTableOption }) {
  const auth = useAuth();
  const config = useConfig();
  const [data, _data] = useState<IPartner[]>();
  const [pageIdx, _pageIdx] = useState(1);
  const [itemCount, _itemCount] = useState(1);
  const [form, _form] = useStateForObject({ name: '', memberId: auth.id, callbackUrl: `${config.baseUrl}/api/admin/callbacks-test`, callbackSecret: 'supersecret123' });
  const [eMessage, _eMessage] = useState<Record<string, string | undefined>>();
  const [selections, _selections] = useState<string[]>([]);
  const [modal, _modal] = useStateForObject({ isOpen: false, apiKey: '' });
  const [copied, _copied] = useState(false);

  const fetchData = useCallback(async () => {
    const res = await getAdminPartners({ offset: (pageIdx - 1) * ITEMSIZE, limit: ITEMSIZE, memberId: pageRole == SYS_PAGE_ROLE.PUBLIC ? (auth.id ?? undefined) : undefined });
    _data(res.data?.map((e, idx) => ({ IDX: idx + 1, ...e })));
    _itemCount(res.total);
  }, [pageIdx, auth, pageRole]);

  useEffect(() => {
    void (() => fetchData())();
  }, [fetchData]);

  const validateForm = () => {
    if (form.name == '') return { name: 'name을 입력하세요' };
    else if (form.callbackUrl == '') return { callbackUrl: 'callbackUrl 입력하세요' };
    else if (form.callbackSecret == '') return { callbackSecret: 'callbackSecret 입력하세요' };
    return undefined;
  };

  async function hdCreateItem() {
    try {
      const valid = validateForm();
      if (valid) return _eMessage(valid);

      const res = await postAdminPartner(form);
      _modal({ isOpen: true, apiKey: res.apiKey });
      await fetchData();
      _pageIdx(1);
      _eMessage(undefined);
    } catch (err) {
      const e = parseApiError(err);
      if (e.message.includes('name')) _eMessage({ name: e.message });
      else if (e.message.includes('callbackUrl')) _eMessage({ callbackUrl: e.message });
      else if (e.message.includes('callbackSecret')) _eMessage({ callbackSecret: e.message });
      else _eMessage({ name: e.message });
    }
  }

  async function hdRemoveItems() {
    await removeAdminPartners(selections);
    _pageIdx(1);
  }

  async function hdChangeCell(change: ITxCoolTableChangeCellEvent<IPartner>): Promise<boolean> {
    if (!confirm('내용을 변경 하시겠습니까?')) return false;
    try {
      await patchAdminPartner(change.rowdata.id, { [change.key]: change.newValue as string });
      return true;
    } catch (err) {
      alert(parseApiError(err)?.message);
      return false;
    }
  }

  async function hdApiKeyReset(id: string) {
    const res = await postAdminPartnerApiKeyReset(id);
    await fetchData();
    _modal({ isOpen: true, apiKey: res.data.apiKey });
  }

  function customRederBody(props: ITxCoolTableRenderBodyProps<IPartner, 'key-reset'>): ReactNode {
    switch (props.key) {
      case 'key-reset':
        return <TxButton variant="text" label="API KEY 재발행" onClick={() => hdApiKeyReset(props.rowdata.id)} />;
      default:
        return defaultBodyRenderer(props);
    }
  }

  async function hdCopyClipboard() {
    await copyToClipboard(modal.apiKey);
    _copied(true);
  }

  if (!data) return <TxLoading className="flex-1" visible={true} />;
  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="flex items-end justify-end gap-3 mb-4">
        {selections?.length > 0 ? (
          <TxButton label="선택 비활성" onClick={hdRemoveItems} />
        ) : (
          <>
            <TxFieldInput caption="name" onChangeText={(t) => _form({ name: t })} error={eMessage?.name} />
            <TxFieldInput caption="callbackUrl" value={form.callbackUrl} onChangeText={(t) => _form({ callbackUrl: t })} error={eMessage?.callbackUrl} />
            <TxFieldInput caption="callbackSecret" value={form.callbackSecret} onChangeText={(t) => _form({ callbackSecret: t })} error={eMessage?.callbackSecret} />
            <TxButton label="생성하기" onClick={hdCreateItem} />
          </>
        )}
      </div>
      <TxCoolTableScroller className="flex-1 flex" footer={itemCount > ITEMSIZE && <TxCoolTablePagination value={pageIdx} itemCount={itemCount} onChangePage={_pageIdx} itemVisibleCount={ITEMSIZE} />}>
        <TxCoolTable className="w-full text-sm text-center" data={data} renderBody={customRederBody} options={tableOptions} onChangeCell={hdChangeCell} onSelections={(items) => _selections(items.map((e) => e.id))} useCheckBox useMultiSelect />
      </TxCoolTableScroller>
      <TxModal visible={modal.isOpen} onExit={() => void (_modal({ isOpen: false, apiKey: '' }), _copied(false))}>
        <div className="mb-2">❗apiKey는 서버에 보관하지 않으므로 분실시 재발행해야 합니다.</div>
        <div className="border bg-gray-500 flex gap-2 w-full rounded justify-center items-center">
          <div className="text-white flex-1 justify-center items-center p-2">{modal.apiKey}</div>
          <TxButton className="w-[6em]" label={!copied ? 'COPY' : 'COPIED'} onClick={hdCopyClipboard} />
        </div>
      </TxModal>
    </div>
  );
}
