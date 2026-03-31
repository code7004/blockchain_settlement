// utils.ts

import React from 'react';

export function safeRender(value: unknown): React.ReactNode {
  if (value instanceof Date) return value.toISOString();
  if (React.isValidElement(value)) return value;
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (Array.isArray(value)) return `[ ... ]`;
  if (typeof value === 'object') return `{ ... }`;
  return value as React.ReactNode;
}

// ✅ blur 시 캐스팅만 해서 이벤트 전달
export function castValue(oldValue: unknown, newValue: string): string | number | boolean {
  if (oldValue == null) return newValue;
  switch (typeof oldValue) {
    case 'number': {
      const n = Number(newValue);
      return isNaN(n) ? newValue : n;
    }
    case 'boolean':
      return newValue.toLowerCase() === 'true';
    case 'string':
      return newValue;
    default:
      return newValue;
  }
}

export function setNestedValue(obj: Record<string, unknown>, path: string, changeValue: unknown): Record<string, unknown> {
  if (!obj || typeof path !== 'string') return obj;

  const keys = path.split('.');
  const newObj: Record<string, unknown> = { ...obj };

  let acc: Record<string, unknown> = newObj;

  keys.forEach((key, idx) => {
    if (idx === keys.length - 1) {
      acc[key] = changeValue;
    } else {
      acc[key] = { ...((acc[key] as Record<string, unknown>) || {}) };
      acc = acc[key] as Record<string, unknown>;
    }
  });

  return newObj;
}

// ✅ unknown 기반 안전 접근
export function getNestedValue(obj: unknown, path: string): unknown {
  if (!obj || typeof path !== 'string') return undefined;

  const keys = path.split('.');
  let acc: unknown = obj;

  for (let i = 0; i < keys.length; i++) {
    if (acc == null || typeof acc !== 'object') return undefined;
    acc = (acc as Record<string, unknown>)[keys[i]];
  }

  return acc;
}
