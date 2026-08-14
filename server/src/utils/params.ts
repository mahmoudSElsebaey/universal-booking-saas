/**
 * Express 5 types route params as `string | string[]`.
 * Normalize to a single string for service layer calls.
 */
export function param(
  value: string | string[] | undefined,
  fallback = ''
): string {
  if (Array.isArray(value)) return value[0] ?? fallback
  return value ?? fallback
}
