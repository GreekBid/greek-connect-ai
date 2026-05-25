/**
 * Backward-compat shim. New code should import from `@/lib/schemas`.
 */
export { LIMITS } from "./schemas";

export type ValidationResult =
  | { ok: true; value: string; error?: undefined }
  | { ok: false; value?: undefined; error: string };

export function validateText(
  raw: string | null | undefined,
  opts: { max: number; min?: number; field?: string }
): ValidationResult {
  const value = (raw ?? "").trim();
  const min = opts.min ?? 1;
  const field = opts.field ?? "Field";
  if (value.length < min) return { ok: false, error: `${field} cannot be empty` };
  if (value.length > opts.max) return { ok: false, error: `${field} must be ${opts.max} characters or fewer` };
  return { ok: true, value };
}
