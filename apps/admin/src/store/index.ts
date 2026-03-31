// store/index.ts
import { configureStore, createListenerMiddleware, type Action } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import type { PersistedState } from 'redux-persist';
import { createMigrate, PERSIST, persistReducer, PURGE, REGISTER, REHYDRATE, type MigrationManifest } from 'redux-persist';
import localStorage from 'redux-persist/lib/storage';

import auth, { type IStateAuth } from './auth';
import config, { configAction, type IStateConfig } from './config';

import { authAction } from './auth';

export const APP_VERSION = '202603010001';
export interface IState {
  auth: IStateAuth;
  config: IStateConfig;
}

export type Nullable<T> = { [K in keyof T]: T[K] | null };

const authMigrations: MigrationManifest = {
  1: (state: unknown) => {
    const s = state as (PersistedState & Partial<IStateAuth>) | undefined;
    if (!s) return s;

    return { ...s, _persist: s._persist, expiresAt: s.expiresAt ?? null };
  },
  2: () => undefined,
};

const rootMigrations: MigrationManifest = {
  1: (state: unknown) => {
    const s = state as PersistedState | undefined;
    if (!s) return s;

    return { ...s, _persist: s._persist };
  },
  2: () => undefined,
};

const authPersistConfig = {
  key: 'auth',
  version: 2,
  storage: localStorage,
  migrate: createMigrate(authMigrations, { debug: false }),
};

const rootPersistConfig = {
  key: 'core',
  version: 5,
  storage: localStorage,
  migrate: createMigrate(rootMigrations, { debug: false }),
};

const rootReducer = combineReducers({
  config,
  auth: persistReducer(authPersistConfig, auth),
});

const persistor = persistReducer(rootPersistConfig, rootReducer);

const authGuard = createListenerMiddleware();

// ✅ REHYDRATE 시 만료검사 & 임박 시 갱신 트리거
authGuard.startListening({
  predicate: (action: Action) => action.type === REHYDRATE,
  effect: (_action, api) => {
    const state = api.getState() as IState;
    const a = state.auth;
    const c = state.config;

    // versioning
    // 🔥 appVersion 불일치 → 강제 로그아웃
    if (c.version !== APP_VERSION) {
      if (a?.isSigned) {
        alert('앱 신규버전으로 인해 재로그인 하셔야 합니다.');
        api.dispatch(authAction.signOut());
      }
      api.dispatch(configAction.update({ version: APP_VERSION }));
      return;
    }
    // auth

    if (!a?.isSigned) return;

    const now = Date.now();
    const exp = a.expiresAt ?? 0;

    if (!exp || exp <= now) {
      api.dispatch(authAction.signOut());
      return;
    }

    // (선택) 만료 임박 시 자동 갱신 로직
    const remainMs = exp - now;
    if (remainMs < 3 * 60_000) {
      try {
        // const { data } = await axios.post("/api/auth/refresh"); // 서버 연동 가능 시
        // api.dispatch(updateAuth({ token: data.accessToken, expiresAt: Date.now() + 10*60_000 }));
      } catch {
        api.dispatch(authAction.signOut());
      }
    }
  },
});

export const store = configureStore({
  reducer: persistor,
  middleware: (gDM) =>
    gDM({
      serializableCheck: { ignoredActions: [PERSIST, PURGE, REGISTER, REHYDRATE] },
    }).prepend(authGuard.middleware),
});
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
