/**
 * Strict parse of a positive integer from untrusted input (route params,
 * query strings). Unlike `parseInt`, trailing garbage such as `"12abc"` and
 * values like `"1e3"` or `"0x10"` are rejected instead of silently coerced.
 */
export function parsePositiveInt(raw: string | null | undefined): number | null {
  if (!raw || !/^\d+$/.test(raw)) return null;
  const value = Number(raw);
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}
