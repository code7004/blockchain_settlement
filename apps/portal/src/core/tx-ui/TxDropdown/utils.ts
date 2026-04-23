import type { ITxDropdownData, ITxDropdownItem, InferDropdownValue } from '.';

export function normalizeMulti<TData extends ITxDropdownData>(data: TData, values?: InferDropdownValue<TData>[]): ITxDropdownItem<InferDropdownValue<TData>>[] {
  const set = new Set<InferDropdownValue<TData>>(values ?? []);

  return (data ?? []).map((item) => {
    const isObjectItem = typeof item === 'object' && item !== null;
    const value = isObjectItem ? item.value : item;

    if (isObjectItem) {
      return {
        ...item,
        checked: set.has(value as InferDropdownValue<TData>),
      };
    }

    return {
      name: String(item),
      value: value as InferDropdownValue<TData>,
      checked: set.has(value as InferDropdownValue<TData>),
    };
  });
}
