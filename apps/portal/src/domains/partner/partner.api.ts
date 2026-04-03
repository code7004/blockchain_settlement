import { apiget, apipatch, apipost, type GetTableQueryDto, type IApiResponse } from '@/core/network';
import { removeUndefined } from '@/core/network/api.utils';
import type { Undefinedable } from '@/store';

export type PartnerDto = {
  /**
   * PK (UUID)
   */
  id: string;
  /**
   * 파트너 이름 (고유)
   */
  name: string;
  /**
   * 콜백 URL (입금 확정 시 호출)
   */
  callbackUrl: string;
  /**
   * 콜백 서명용 Secret (HMAC)
   */
  callbackSecret: string;
  /**
   * API Key prefix (노출 가능)
   */
  apiKeyPrefix: string;
  /**
   * API Key hash (원본 저장 금지)
   */
  apiKeyHash: string;
  /**
   * API Key 생성 시간
   */
  apiKeyCreatedAt: Date;
  /**
   * 관리자(Member) 참조
   */
  memberId: string;
  /**
   * 활성 여부
   */
  isActive: boolean;
  /**
   * 생성 시간
   */
  createdAt: Date;
  /**
   * 수정 시간
   */
  updatedAt: Date;
};
export type PartnerCreateDto = Pick<PartnerDto, 'name' | 'callbackUrl' | 'callbackSecret' | 'memberId'>;
export type PartnerPatchDto = Partial<Pick<PartnerDto, 'name' | 'callbackUrl' | 'callbackSecret' | 'isActive'>>;
export interface PartnerWithApiKeyDto extends PartnerDto {
  apiKey: string;
}

export type PartnersGetQueryDto = Pick<Undefinedable<PartnerDto>, 'memberId'> & GetTableQueryDto;

export function apiCreatePartner(form: PartnerCreateDto) {
  return apipost<PartnerWithApiKeyDto>(`/portal/partners`, form);
}

export function apiGetPartners(params?: PartnersGetQueryDto) {
  return apiget<IApiResponse<PartnerDto[]>>('/portal/partners', removeUndefined(params));
}

export function apiPatchPartner(id: string, params: PartnerPatchDto) {
  return apipatch<IApiResponse<PartnerDto>>(`/portal/partners/${id}`, removeUndefined(params));
}

export function apiResetPartnerApiKey(id: string) {
  return apipost<IApiResponse<{ apiKey: string }>>(`/portal/partners/${id}/api-key/rotate`);
}
