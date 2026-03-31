import { get, patch, post, remove, type IApiPagenationQuery, type IApiResponse } from '@/core/network';
import { removeUndefined } from '@/core/network/api.utils';

export interface IPartner {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
}

export type IPartnerPatch = Partial<{
  name: string;
  callbackUrl: string;
  callbackSecret: string;
  isActive: boolean;
}>;

export interface GetPartnersQueryDto extends IApiPagenationQuery {
  memberId?: string;
}

export interface IPartnerIdQuery extends IApiPagenationQuery {
  partnerId: string;
}

export function postAdminPartner(form: { name: string }) {
  return post<IPartner & { apiKey: string }>(`/api/admin/partners`, form);
}

export function getAdminPartners(params?: GetPartnersQueryDto) {
  return get<IApiResponse<IPartner[]>>('/api/admin/partners', removeUndefined(params));
}

export function patchAdminPartner(id: string, params: IPartnerPatch) {
  return patch<IApiResponse<IPartner>>(`/api/admin/partners/${id}`, removeUndefined(params));
}

export function removeAdminPartners(ids: string[]) {
  return remove<IApiResponse<{ test: string }>>('/api/admin/partners', { body: { ids } });
}

export function postAdminPartnerApiKeyReset(id: string) {
  return post<IApiResponse<{ apiKey: string }>>(`/api/admin/partners/${id}/api-key/rotate`);
}
