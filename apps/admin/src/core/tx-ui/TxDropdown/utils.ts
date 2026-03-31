import type { ITxDropdownData, ITxDropdownItem, TxDropdownValue } from '.';

// ✅ multi normalize
export function normalizeMulti(data: ITxDropdownData, values?: TxDropdownValue[]): ITxDropdownItem[] {
  const set = new Set(values ?? []);

  return data?.map((item) => {
    const value = typeof item === 'object' ? item.value : item;

    return typeof item === 'object' ? { ...item, checked: set.has(value) } : { name: String(item), value, checked: set.has(value) };
  });
}
