/* eslint-disable @typescript-eslint/no-explicit-any */

import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type { IApiError } from '.';

interface RequestMeta {
  startTime: number;
}

interface ExtendedConfig {
  metadata?: RequestMeta;
  data?: unknown;
}

const DEBUG = import.meta.env.VITE_API_DEBUG === 'true';

function parseUrl(url?: string) {
  if (!url) return '';
  try {
    const u = new URL(url, window.location.origin);
    return u.pathname + u.search;
  } catch {
    return url;
  }
}

function maskSensitive(data: Record<string, unknown> | undefined) {
  if (!data) return data;

  const clone = { ...data };

  if (clone.password) clone.password = '******';
  if (clone.privateKey) clone.privateKey = '******';
  if (clone.token) clone.token = '******';

  return clone;
}

export function attachInterceptors(instance: AxiosInstance) {
  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig<{ data: Record<string, unknown> }>) => {
      const extended = config as typeof config & ExtendedConfig;

      extended.metadata = { startTime: Date.now() };

      if (DEBUG) {
        console.groupCollapsed(`%c[REQ] ${config.method?.toUpperCase()} ${parseUrl(config.url)}`, 'color: #3b82f6');
        console.log('params:', config.params);
        console.log('data:', maskSensitive(config.data));
        console.groupEnd();
      }

      return config;
    },
    (error) => {
      console.error('[REQUEST ERROR]', error);
      return Promise.reject(error);
    },
  );

  instance.interceptors.response.use(
    (response) => {
      if (DEBUG) {
        const start = ((response.config as any).metadata?.startTime ?? Date.now()) as number;
        const duration = Date.now() - start;

        console.groupCollapsed(`%c[RES] ${response.status} ${parseUrl(response.config.url)} (${duration}ms)`, 'color: #22c55e');
        console.log('data:', response.data);
        console.groupEnd();
      }

      return response;
    },
    (error: AxiosError) => {
      const status = error.response?.status ?? 'NETWORK';
      const message = typeof error.response?.data === 'object' ? JSON.stringify(error.response?.data) : error.message;

      console.groupCollapsed(`%c[ERR] ${status} ${parseUrl(error.config?.url)}`, 'color: #ef4444');
      console.error(message);
      console.groupEnd();

      return Promise.reject(error);
    },
  );
}

// utils.ts
export function removeUndefined<T extends object>(params?: T): Partial<T> {
  if (!params) return {};

  const result: Partial<T> = {};

  Object.keys(params).forEach((key) => {
    const value = params[key as keyof T];

    if (value !== undefined && String(value).trim() !== '') {
      result[key as keyof T] = value;
    }
  });

  return result;
}

export function parseApiError(err: unknown): IApiError {
  const defaultError: IApiError = {
    statusCode: 500,
    message: 'Unknown error',
  };

  if (!err) return defaultError;

  // Axios 에러
  if ((err as AxiosError).isAxiosError) {
    const axiosErr = err as AxiosError<IApiError>;

    const data = axiosErr.response?.data;

    if (data) {
      return {
        statusCode: data.statusCode ?? axiosErr.response?.status ?? 500,
        message: data.message ?? 'Request failed',
        error: data.error,
        path: data.path,
        timestamp: data.timestamp,
      };
    }

    return {
      statusCode: axiosErr.response?.status ?? 500,
      message: axiosErr.message,
    };
  }

  // 일반 Error
  if (err instanceof Error) {
    return {
      statusCode: 500,
      message: err.message,
    };
  }

  return defaultError;
}

export function isTokenExpired(expiresAt: number | undefined) {
  if (!expiresAt) return true;
  return Date.now() > expiresAt;
}

/* eslint-enable @typescript-eslint/no-explicit-any */
