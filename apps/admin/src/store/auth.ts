// store/auth.ts
import { getAxios } from '@/core/network';
import type { IMembers } from '@/domains/member/member.api';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Nullable } from '.';

export interface IStateAuth extends Nullable<Omit<IMembers, 'password'>> {
  autoLogin: boolean;
  isSigned: boolean;
  accessToken?: string;
  expiresAt?: number;
}

const initialState: IStateAuth = {
  username: null,
  isSigned: false,
  expiresAt: undefined,
  autoLogin: false,
  id: null,
  role: null,
  isActive: false,
  createdAt: null,
  updatedAt: null,
  accessToken: undefined,
};

type UpdatePayload = Partial<IStateAuth>;

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    updateAuth: (state, action: PayloadAction<UpdatePayload>) => {
      Object.assign(state, action.payload);
    },
    signIn: (state, action: PayloadAction<UpdatePayload>) => {
      const { autoLogin = false, expiresAt, accessToken, ...payload } = action.payload;

      Object.assign(state, payload);

      state.expiresAt = expiresAt;

      state.autoLogin = autoLogin;
      state.accessToken = accessToken;

      getAxios().defaults.headers.common = {};
      getAxios().defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      state.isSigned = true;
    },
    signOut: () => ({ ...initialState }),
  },
});

export const authAction = authSlice.actions;
export default authSlice.reducer;
