import { type AxiosRequestConfig } from 'axios';
import { getAxios } from '.';

/**
 * 공통 GET 요청
 *
 * @template T 응답 데이터 타입
 * @param url 요청 URL
 * @param params Query String 파라미터
 * @param config Axios 추가 옵션 (headers 등)
 * @returns Promise<T>
 */
export async function apiget<T>(url: string, params?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await getAxios().get<T>(url, {
    params,
    ...config,
  });
  return res.data;
}

/**
 * 공통 POST 요청
 *
 * @template T 응답 데이터 타입
 * @param url 요청 URL
 * @param body Request Body
 * @param config Axios 추가 옵션
 * @returns Promise<T>
 */
export async function apipost<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await getAxios().post<T>(url, body, config);
  return res.data;
}

/**
 * 공통 PATCH 요청 (부분 업데이트)
 *
 * @template T 응답 데이터 타입
 * @param url 요청 URL
 * @param body Request Body (partial data)
 * @param config Axios 추가 옵션
 * @returns Promise<T>
 */
export async function apipatch<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await getAxios().patch<T>(url, body, config);
  return res.data;
}

/**
 * 공통 PUT 요청 (전체 업데이트)
 *
 * @template T 응답 데이터 타입
 * @param url 요청 URL
 * @param body 전체 리소스 데이터
 * @param config Axios 추가 옵션
 * @returns Promise<T>
 */
export async function apiput<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await getAxios().put<T>(url, body, config);
  return res.data;
}

/**
 * 공통 DELETE 요청
 *
 * @template T 응답 데이터 타입
 * @param url 요청 URL
 * @param options params: query, body: request body
 * @param config Axios 추가 옵션
 * @returns Promise<T>
 */
export async function apidelete<T>(url: string, options?: { params?: unknown; body?: unknown }, config?: AxiosRequestConfig): Promise<T> {
  const res = await getAxios().delete<T>(url, {
    params: options?.params,
    data: options?.body,
    ...config,
  });

  return res.data;
}
