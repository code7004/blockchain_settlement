import { TxDropdownPatners } from '@/components/TxDropdownPartners';
import { SYS_PAGE_ROLE } from '@/constants';
import { useStateForObject } from '@/core/hooks';
import { parseApiError } from '@/core/network';
import type { ITxCoolTableChangeCellEvent, ITxCoolTableOption } from '@/core/tx-ui';
import { TxButton, TxCoolTable, TxCoolTablePagination, TxCoolTableScroller, TxFieldInput, TxLoading } from '@/core/tx-ui';
import { defaultBodyRenderer } from '@/lib/defaultBodyRenderer';
import { useCallback, useEffect, useState } from 'react';
import { patchAdminPartner, removeAdminPartners } from '../partner/partner.api';
import { getUsers, postAdminUser, type IUser } from './user.api';

const ITEMSIZE = 50;

export default function UserList({ tableOptions, pageRole }: { pageRole: SYS_PAGE_ROLE; tableOptions: ITxCoolTableOption }) {
  const [data, _data] = useState<IUser[]>();
  const [pageIdx, _pageIdx] = useState(1);
  const [itemCount, _itemCount] = useState(1);
  const [form, _form] = useStateForObject<{ partnerId: string; externalUserId: string }>({ partnerId: '', externalUserId: 'string' });
  const [eMessage, _eMessage] = useState<Record<string, string | undefined>>();
  const [selections, _selections] = useState<string[]>([]);
  const [partnerId, _partnerId] = useState<string>();

  const fetchData = useCallback(async () => {
    if (!partnerId) return;
    const res = await getUsers({ offset: (pageIdx - 1) * ITEMSIZE, limit: ITEMSIZE, partnerId });
    _data(res.data?.map((e, idx) => ({ IDX: idx + 1, ...e })));
    _itemCount(res.total);
  }, [pageIdx, partnerId]);

  useEffect(() => {
    void (() => fetchData())();
  }, [fetchData]);

  const validateForm = () => {
    if (form.partnerId == '') return { partnerId: 'partnerId을 입력하세요' };
    else if (form.externalUserId == '') return { externalUserId: 'externalUserId 입력하세요' };
    return undefined;
  };

  async function hdCreateItem() {
    try {
      const valid = validateForm();
      if (valid) return _eMessage(valid);

      await postAdminUser(form);
      await fetchData();
      _pageIdx(1);
      _eMessage(undefined);
    } catch (err) {
      const e = parseApiError(err);
      if (e.message.includes('partnerId')) _eMessage({ partnerId: e.message });
      else if (e.message.includes('externalUserId')) _eMessage({ externalUserId: e.message });
      else _eMessage({ externalUserId: e.message });

      console.log(e);
    }
  }

  async function hdRemoveItems() {
    await removeAdminPartners(selections);
    _pageIdx(1);
  }

  async function hdChangeCell(change: ITxCoolTableChangeCellEvent<IUser>): Promise<boolean> {
    if (!confirm('내용을 변경 하시겠습니까?')) return false;
    try {
      await patchAdminPartner(change.rowdata.id, { [change.key]: change.newValue as string });
      return true;
    } catch (err) {
      alert(parseApiError(err)?.message);
      return false;
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="flex items-end justify-between gap-3 mb-4">
        <TxDropdownPatners onChangeText={_partnerId} pageRole={pageRole} />
        {selections?.length > 0 ? (
          <TxButton label="선택 비활성" onClick={hdRemoveItems} />
        ) : (
          <div className="flex items-end justify-between gap-3 ">
            <TxFieldInput caption="partnerId" onChangeText={(t) => _form({ partnerId: t })} error={eMessage?.partnerId} />
            <TxFieldInput caption="externalUserId" onChangeText={(t) => _form({ externalUserId: t })} error={eMessage?.externalUserId} />
            <TxButton label="생성하기" onClick={hdCreateItem} />
          </div>
        )}
      </div>
      <TxCoolTableScroller className="flex-1 flex" footer={itemCount > ITEMSIZE && <TxCoolTablePagination value={pageIdx} itemCount={itemCount} onChangePage={_pageIdx} itemVisibleCount={ITEMSIZE} />}>
        {!data ? (
          <TxLoading className="flex-1 h-full" visible={true} />
        ) : (
          <TxCoolTable className="w-full text-sm text-center" data={data} renderBody={defaultBodyRenderer} options={tableOptions} onChangeCell={hdChangeCell} onSelections={(items) => _selections(items.map((e) => e.id))} useCheckBox useMultiSelect />
        )}
      </TxCoolTableScroller>
    </div>
  );
}
