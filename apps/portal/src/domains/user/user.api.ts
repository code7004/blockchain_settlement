import { apiget, apipatch, apipost, removeUndefined, type GetTableQueryDto, type IApiResponse } from '@/core/network';
import type { User } from '@prisma/client';
import type { PartnerDto } from '../partner/partner.api';

export type UserDto = User;

export type CreateUserDto = Pick<UserDto, 'partnerId' | 'externalUserId'>;
export type UpdateUserDto = { isActive?: boolean };
export interface GetUserDto extends GetTableQueryDto {
  partnerId: string;
  isActive?: boolean;
}

export function postAdminUser(form: CreateUserDto) {
  return apipost<PartnerDto & { apiKey: string }>(`/portal/users`, form);
}

export function getUsers(params?: GetUserDto) {
  return apiget<IApiResponse<UserDto[]>>('/portal/users', removeUndefined(params));
}

export function apiPatchUser(id: string, params: UpdateUserDto) {
  return apipatch<IApiResponse<PartnerDto>>(`/portal/users/${id}`, removeUndefined(params));
}
