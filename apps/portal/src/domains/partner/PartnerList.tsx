import { SYS_PAGE_ROLE } from '@/constants';
import { useStateForObject } from '@/core/hooks';
import { parseApiError } from '@/core/network';
import { TxAgGrid, TxButton, TxFlex, TxForm, TxModal, copyToClipboard, type ITxCoolTableOption } from '@/core/tx-ui';
import { useAuth } from '@/store/hooks';
import { useQuery } from '@tanstack/react-query';
import type { CellClickedEvent, CellValueChangedEvent } from 'ag-grid-community';
import { useState } from 'react';
import { apiCreatePartner, apiGetPartners, apiPatchPartner, apiResetPartnerApiKey, type PartnerCreateDto, type PartnerDto } from './partner.api';

const ITEMSIZE = 50;
const QUERYKEY = 'partners';

export default function AdminPartnerList({ pageRole, tableOptions }: { pageRole: SYS_PAGE_ROLE; tableOptions: ITxCoolTableOption }) {
  const auth = useAuth();
  const [filter, _filter] = useStateForObject({ offset: 0, limit: ITEMSIZE, memberId: pageRole == SYS_PAGE_ROLE.PUBLIC ? (auth.id ?? undefined) : undefined });
  const [form, _form] = useStateForObject<PartnerCreateDto>({ name: '', memberId: auth.id ?? '', callbackUrl: `${import.meta.env.VITE_API_BASE_URL_DEV}/portal/callbacks-test`, callbackSecret: 'supersecret123' });
  const [eMessage, _eMessage] = useState<Record<string, string | undefined>>();
  const [modal, _modal] = useStateForObject({ isOpen: false, apiKey: '' });
  const [copied, _copied] = useState(false);

  const { data, refetch, isLoading } = useQuery({
    queryKey: [QUERYKEY, filter],
    queryFn: async () => {
      const res = await apiGetPartners(filter);
      return { data: res.data, total: res.total };
    },
    staleTime: 1000 * 60,
  });

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

      const res = await apiCreatePartner(form);
      _modal({ isOpen: true, apiKey: res.apiKey });
      refetch();
      _filter({ offset: 0 });
      _eMessage(undefined);
    } catch (err) {
      const e = parseApiError(err);
      if (e.message.includes('name')) _eMessage({ name: e.message });
      else if (e.message.includes('callbackUrl')) _eMessage({ callbackUrl: e.message });
      else if (e.message.includes('callbackSecret')) _eMessage({ callbackSecret: e.message });
      else _eMessage({ name: e.message });
    }
  }

  async function hdCellChange(event: CellValueChangedEvent<PartnerDto>) {
    try {
      await apiPatchPartner(event.data.id, { [event.colDef.field as string]: event.value });
      refetch();
    } catch (err) {
      alert(parseApiError(err)?.message);
    }
  }

  async function hdCopyClipboard() {
    await copyToClipboard(modal.apiKey);
    _copied(true);
  }

  async function hdCellClick(event: CellClickedEvent<PartnerDto>) {
    if (event.column.getColId() == 'key-reset' && event.data) {
      const res = await apiResetPartnerApiKey(event.data.id);
      _modal({ isOpen: true, apiKey: res.data.apiKey });
    }
  }

  return (
    <TxFlex className="flex flex-1 flex-col gap-2">
      <TxForm className="flex flex-row items-end justify-end gap-3 mb-4">
        <TxForm.Input caption="name" onChangeText={(t) => _form({ name: t })} error={eMessage?.name} />
        <TxForm.Input caption="callbackUrl" value={form.callbackUrl} onChangeText={(t) => _form({ callbackUrl: t })} error={eMessage?.callbackUrl} />
        <TxForm.Input caption="callbackSecret" value={form.callbackSecret} onChangeText={(t) => _form({ callbackSecret: t })} error={eMessage?.callbackSecret} />
        <TxButton label="생성하기" onClick={hdCreateItem} />
      </TxForm>

      <TxAgGrid
        rowData={data?.data}
        option={tableOptions}
        isLoading={isLoading}
        defaultColDef={{ flex: 1 }}
        offset={filter.offset}
        pagination={{
          currentPage: 1 + filter.offset / ITEMSIZE,
          totalRows: data?.total ?? 0,
          pageSize: ITEMSIZE,
          onChangePage: (page) => _filter({ offset: (page - 1) * ITEMSIZE }),
        }}
        onCellClicked={hdCellClick}
        stopEditingWhenCellsLoseFocus={true}
        onCellValueChanged={hdCellChange}
      />
      <TxModal visible={modal.isOpen} onExit={() => void (_modal({ isOpen: false, apiKey: '' }), _copied(false))}>
        <div className="mb-2">❗apiKey는 서버에 보관하지 않으므로 분실시 재발행해야 합니다.</div>
        <div className="border bg-gray-500 flex gap-2 w-full rounded justify-center items-center">
          <div className="text-white flex-1 justify-center items-center p-2">{modal.apiKey}</div>
          <TxButton className="w-[6em]" label={!copied ? 'COPY' : 'COPIED'} onClick={hdCopyClipboard} />
        </div>
      </TxModal>
    </TxFlex>
  );
}
