import { SERVER_TYPE } from '@/constants';
import { changeAxiosBaseUrl } from '@/core/network';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface IStateConfig extends Record<string, unknown> {
  darkMode: boolean;
  language: string;
  autoLogin: boolean;
  version: string;
  server: string;
  baseUrl: string;
}

const initialState: IStateConfig = {
  darkMode: true,
  language: 'kr',
  autoLogin: false,
  providers: [],
  version: '000',
  server: SERVER_TYPE.TEST,
  baseUrl: import.meta.env.VITE_API_BASE_URL_DEV,
};

type UpdatePayload = Partial<IStateConfig>;

export const userSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    update: (state, action: PayloadAction<UpdatePayload>) => {
      Object.assign(state, action.payload);
    },
    changeServer: (state, action: PayloadAction<string>) => {
      state.server = action.payload;
      const base = action.payload == SERVER_TYPE.LIVE ? import.meta.env.VITE_API_BASE_URL_LIVE : import.meta.env.VITE_API_BASE_URL_DEV;

      state.baseUrl = base;
      // console.log(base, action.payload, import.meta.env.VITE_API_BASE_URL_LIVE, import.meta.env.VITE_API_BASE_URL_DEV);
      changeAxiosBaseUrl(base);
    },
    darkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function

export const configAction = userSlice.actions;

export default userSlice.reducer;
