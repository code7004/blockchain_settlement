import { getAxios } from '.';

// core.ts

export async function get<T>(url: string, params?: unknown) {
  const res = await getAxios().get<T>(url, { params });
  return res.data;
}

export async function post<T>(url: string, body?: unknown) {
  const res = await getAxios().post<T>(url, body);
  return res.data;
}

export async function patch<T>(url: string, body?: unknown) {
  const res = await getAxios().patch<T>(url, body);
  return res.data;
}

export async function remove<T>(url: string, options?: { params?: unknown; body?: unknown }) {
  const res = await getAxios().delete<T>(url, { params: options?.params, data: options?.body });

  return res.data;
}
