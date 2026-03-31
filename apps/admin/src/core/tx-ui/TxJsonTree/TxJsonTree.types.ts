import type { DeepPartial, TxJsonTreeTheme } from '..';

export type JsonPrimitive = string | number | boolean | null;

export type JsonValue = JsonPrimitive | { [key: string]: JsonValue } | JsonValue[];

// ✅ "JSON 형태 객체" 허용
export type JsonLikeObject = {
  [key: string]: JsonLike;
};

// ✅ 핵심: 일반 객체도 허용
export type JsonLike = JsonPrimitive | JsonLikeObject | JsonLike[] | Record<string, unknown>; // ⭐️ IUser 같은 타입 허용

export type JsonArray = JsonLike[];
export interface JsonObject {
  [key: string]: JsonLike;
}

export type JsonType = 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array';

export type EditableValue = string | number | boolean | null;

export interface ITxJsonTreeProps<T = unknown> {
  data: T;
  theme?: DeepPartial<typeof TxJsonTreeTheme>;
  onClick?: (path: string[], value: unknown) => void;
  onEdit?: (path: string[], newValue: unknown, oldValue: unknown) => void;
  onAdd?: (path: string[], key: string, value: unknown) => void;
  onDelete?: (path: string[], oldValue: unknown) => void;
  isRootType?: boolean;
  locale?: (t: string) => string;
}

export interface ITreeNodeProps {
  value: unknown;
  theme: Required<typeof TxJsonTreeTheme>;
  path: string[];
  isRootType?: boolean;
  onClick?: ITxJsonTreeProps['onClick'];
  onEdit?: ITxJsonTreeProps['onEdit'];
  onAdd?: ITxJsonTreeProps['onAdd'];
  onDelete?: ITxJsonTreeProps['onDelete'];
  locale?: (t: string) => string;
}
