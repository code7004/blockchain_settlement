import type { PRISMA_MEMBER_ROLE } from '@/constants';
import { get, patch, post, remove, type IApiPagenationQuery, type IApiResponse } from '@/core/network';
import { removeUndefined } from '@/core/network/api.utils';

export interface IMembers {
  id: string;
  username: string;
  role: PRISMA_MEMBER_ROLE;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function postAdminMember(form: { username: string; password: string; role: string }) {
  return post<IApiResponse<{ test: string }>>('/api/admin/members', form);
}

export function getAdminMembers(params?: IApiPagenationQuery) {
  return get<IApiResponse<IMembers[]>>('/api/admin/members', removeUndefined(params));
}

export function removeAdminMembers(ids: string[]) {
  return remove<IApiResponse<{ test: string }>>('/api/admin/members', { body: { ids } });
}

export interface IVerifyPwdMemberDto {
  id: string;
  password: string;
}

export function postVerifyPwd(form: IVerifyPwdMemberDto) {
  return post(`/api/admin/auth/verify-pwd`, form);
}

export interface IChangePwdMemberDto {
  id: string;
  oldPassword: string;
  newPassword: string;
}

export function patchChangePwd(form: IChangePwdMemberDto) {
  return patch(`/api/admin/auth/change-pwd`, form);
}
