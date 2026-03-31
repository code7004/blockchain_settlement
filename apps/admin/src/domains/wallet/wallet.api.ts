import { get, removeUndefined, type IApiResponse } from '@/core/network';
import type { IPartnerIdQuery } from '../partner/partner.api';
import type { IUser } from '../user/user.api';

export interface IWallet {
  id: string;
  partnerId: string;
  userId: string;
  externalUserId: string;
  address: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  user: IUser;
}

export function getAdminWallets(params?: IPartnerIdQuery) {
  return get<IApiResponse<IWallet[]>>('/api/admin/wallets', removeUndefined(params));
}
