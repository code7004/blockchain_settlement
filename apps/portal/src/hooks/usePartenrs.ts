import { SYS_PAGE_ROLE } from '@/constants';
import { apiGetPartners } from '@/domains/partner/partner.api';
import { configAction } from '@/store/config';
import { useAppDispatch, useAuth, useConfig } from '@/store/hooks';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';

export function usePartners(pageRole: SYS_PAGE_ROLE) {
  const auth = useAuth();
  const config = useConfig();

  const dispatch = useAppDispatch();

  const _partnerId = (partnerId: string | undefined) => dispatch(configAction.update({ partnerId }));

  const { data } = useQuery({
    queryKey: ['partners', pageRole, auth.id],
    queryFn: async () => {
      const res = await apiGetPartners({ memberId: pageRole === SYS_PAGE_ROLE.PUBLIC ? (auth.id as string) : undefined });

      const data = _.orderBy(
        res.data.map((e) => ({ name: e.name, value: e.id })),
        'name',
      );

      if (!config.partnerId && data && data.length > 0) {
        _partnerId(data[0].value);
      }

      return data;
    },
    enabled: pageRole !== SYS_PAGE_ROLE.PUBLIC || !!auth.id,
    staleTime: 1000 * 60, // ⭐ 파트너는 거의 안바뀜 → 길게
  });

  return { partnerId: config.partnerId, _partnerId, partners: data };
}
