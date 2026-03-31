import { get, post, removeUndefined, type IApiResponse } from '@/core/network';
import type { IPartner, IPartnerIdQuery } from '../partner/partner.api';

export interface IUser {
  id: string;
  partnerId: string;
  externalUserId: string;
  isActive: boolean;
  createdAt: Date;
}

export function postAdminUser(form: { partnerId: string; externalUserId: string }) {
  return post<IPartner & { apiKey: string }>(`/api/admin/users`, form);
}

export function getUsers(params?: IPartnerIdQuery) {
  return get<IApiResponse<IUser[]>>('/api/admin/users', removeUndefined(params));
}
