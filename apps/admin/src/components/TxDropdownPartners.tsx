import { SYS_PAGE_ROLE } from '@/constants';
import { TxFieldDropdown, type ITxDropdownItem, type ITxDropdownProps } from '@/core/tx-ui';
import { getAdminPartners } from '@/domains/partner/partner.api';
import { useAuth } from '@/store/hooks';
import _ from 'lodash';
import { useEffect, useState } from 'react';

interface ITxDropdownPartner extends Omit<ITxDropdownProps, 'data'> {
  pageRole: SYS_PAGE_ROLE;
}

export function TxDropdownPatners({ pageRole, onChangeText, ...props }: ITxDropdownPartner) {
  const auth = useAuth();
  const [partners, setPartners] = useState<ITxDropdownItem[]>([]);
  const [value, _value] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const res = await getAdminPartners({ memberId: pageRole == SYS_PAGE_ROLE.PUBLIC ? (auth.id ?? undefined) : undefined });
      const items = _.orderBy(
        res.data.map((e) => ({ name: e.name, value: e.id })),
        'name',
      );
      if (!items || items.length < 1) return;
      setPartners(items);
      _value(items[0].value);
      onChangeText?.(items[0].value);
    };

    void fetchData();
  }, [auth, pageRole, onChangeText]);

  function hdChangeText(t: string) {
    _value(t);
    onChangeText?.(t);
  }

  return <TxFieldDropdown {...props} data={partners} value={value} caption="PARTNER" onChangeText={hdChangeText} error={!partners || partners.length < 1 ? '등록된 파트너가 없습니다' : ''} />;
}
