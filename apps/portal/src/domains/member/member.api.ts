import { apiget, apipatch, apipost, type GetTableQueryDto, type IApiResponse } from '@/core/network';
import { removeUndefined } from '@/core/network/api.utils';
import type { Member } from '@prisma/client';

export enum MemberRole {
  OWNER = 'OWNER',
  OPERATOR = 'OPERATOR',
  DEVELOPER = 'DEVELOPER',
}

export type MemberDto = Omit<Member, 'password'>;
export type CreateMemberDto = Pick<Member, 'username' | 'password' | 'role'>;
export type UpdateMemberDto = Pick<MemberDto, 'isActive'>;
export type VerifyMemberPasswordDto = Pick<MemberDto, 'id'> & { password: string };

export interface ChangeMemberMemberPasswordDto extends Pick<MemberDto, 'id'> {
  oldPassword: string;
  newPassword: string;
}

export function apiPostMember(form: CreateMemberDto) {
  return apipost<IApiResponse<MemberDto>>('/portal/members', form);
}

export function apiGetMembers(params?: GetTableQueryDto) {
  return apiget<IApiResponse<MemberDto[]>>('/portal/members', removeUndefined(params));
}

export function apiPatchMember(id: string, body: UpdateMemberDto) {
  return apipatch<IApiResponse<MemberDto>>(`/portal/members/${id}`, body);
}

export function apiVerifyPwd(form: VerifyMemberPasswordDto) {
  return apipost(`/portal/auth/verify-pwd`, form);
}

export function apiPatchChangePwd(form: ChangeMemberMemberPasswordDto) {
  return apipatch(`/portal/auth/change-pwd`, form);
}
