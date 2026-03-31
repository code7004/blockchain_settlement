import type { EditableValue, JsonType } from '.';

// ✅ 유틸: 값 타입 판별
export function getType(v: unknown): JsonType {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';

  const t = typeof v;

  if (t === 'string' || t === 'number' || t === 'boolean') {
    return t;
  }

  // JSON 외 타입 방어 (절대 오면 안됨)
  return 'object';
}

export function isPrimitive(v: unknown): v is EditableValue {
  return v === null || typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean';
}
