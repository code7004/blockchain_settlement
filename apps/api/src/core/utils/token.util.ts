export const TOKEN_DECIMALS = 6;

export function formatTokenAmount(raw: number) {
  const value = raw / 10 ** TOKEN_DECIMALS;

  return {
    raw,
    token: value,
    display: value.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: TOKEN_DECIMALS,
    }),
  };
}
