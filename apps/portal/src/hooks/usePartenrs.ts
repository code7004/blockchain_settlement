import { SYS_PAGE_ROLE } from '@/constants';
import { apiGetPartners } from '@/domains/partner/partner.api';
import { useAuth } from '@/store/hooks';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';

export function usePartners(pageRole: SYS_PAGE_ROLE) {
  const auth = useAuth();

  return useQuery({
    queryKey: ['partners', pageRole, auth.id],
    queryFn: async () => {
      const res = await apiGetPartners({ memberId: pageRole === SYS_PAGE_ROLE.PUBLIC ? (auth.id as string) : undefined });

      return _.orderBy(
        res.data.map((e) => ({ name: e.name, value: e.id })),
        'name',
      );
    },
    enabled: pageRole !== SYS_PAGE_ROLE.PUBLIC || !!auth.id,
    staleTime: 1000 * 60, // ⭐ 파트너는 거의 안바뀜 → 길게
  });
}
