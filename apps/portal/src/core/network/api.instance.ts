// lib/axios.ts
import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { attachInterceptors } from './api.utils';

let instance: AxiosInstance | null = null;

const defaultConfig: AxiosRequestConfig = {
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * 최초 생성
 */
export function initAxios(baseURL: string): AxiosInstance {
  if (!baseURL) {
    throw new Error('baseURL is required');
  }

  if (!instance) {
    instance = axios.create({
      ...defaultConfig,
      baseURL,
    });

    attachInterceptors(instance);
  } else {
    // 이미 있으면 baseURL만 변경
    instance.defaults.baseURL = baseURL;
  }

  return instance;
}

/**
 * instance 반환
 */
export function getAxios(): AxiosInstance {
  if (!instance) {
    throw new Error('Axios is not initialized');
  }
  return instance;
}

/**
 * 설정 변경 (핵심)
 */
export function changeAxiosConfig(config: Partial<AxiosRequestConfig>) {
  if (!instance) {
    throw new Error('Axios is not initialized');
  }

  Object.assign(instance.defaults, config);
}

/**
 * 설정 변경 (핵심)
 */
export function changeAxiosBaseUrl(baseURL: string) {
  if (!instance) {
    throw new Error('Axios is not initialized');
  }
  Object.assign(instance.defaults, { ...defaultConfig, baseURL });
}
