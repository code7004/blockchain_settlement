// tx-ui.utils.tsx
import clsx, { type ClassValue } from 'clsx';
import _ from 'lodash';
import { twMerge } from 'tailwind-merge';
import type { ITxDropdownItem } from '.';

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export function cm(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}

/**
 * TxCoolTableTheme 병합 유틸
 * - merge: 합집합, 충돌 시 custom 우선, 문자열 className은 cm() 병합
 * - override: base 유지, custom 값만 덮어씀, 문자열 className은 교체
 */
export const themeMerge = <T>(base: T, custom?: DeepPartial<T>, policy: 'merge' | 'override' = 'merge'): T => {
  if (!custom) return base;

  if (typeof custom === 'string') {
    return base;
  }

  if (policy === 'merge') {
    // lodash.mergeWith → string은 cm 병합, 그 외는 custom 우선
    return _.mergeWith({}, base, custom, (objValue, srcValue) => {
      if (typeof objValue === 'string' && typeof srcValue === 'string') {
        return cm(objValue, srcValue); // ✅ 문자열 병합
      }
      return undefined; // ✅ 기본 동작 (custom이 우선)
    });
  }

  if (policy === 'override') {
    // lodash.mergeWith → string은 덮어쓰기 (custom 우선)
    return _.mergeWith({}, base, custom, (objValue, srcValue) => {
      if (typeof objValue === 'string' && typeof srcValue === 'string') {
        return srcValue; // ✅ 문자열 교체
      }
      return undefined; // ✅ 기본 동작 (custom만 덮어씀)
    });
  }

  return base;
};

export function getItemKey(item: ITxDropdownItem) {
  const v = item.value;

  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
    return String(v);
  }

  return item.name;
}

export function getDisplayName(type: unknown): string | undefined {
  if (typeof type === 'string') return undefined;
  if (typeof type === 'function') return (type as { displayName?: string }).displayName;
  return undefined;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // ✅ 최신 브라우저 (HTTPS + user gesture 필요)
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // ✅ fallback (구형 브라우저)
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed'; // 화면 스크롤 영향 방지
    textarea.style.left = '-9999px';

    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    const success = document.execCommand('copy');
    document.body.removeChild(textarea);

    return success;
  } catch {
    return false;
  }
}
