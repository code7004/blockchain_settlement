export function parseTxInputNumber(value: string): number | undefined {
  if (value.trim() === '') return undefined;

  const num = Number(value);
  return Number.isNaN(num) ? undefined : num;
}
