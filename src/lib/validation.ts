/**
 * Shared input validation for user-generated text content.
 * Returns trimmed value or an error message.
 */
export const LIMITS = {
  message: 2000,
  bio: 500,
  shortText: 100,
  eventDescription: 1000,
} as const;

export function validateText(
  raw: string | null | undefined,
  opts: { max: number; min?: number; field?: string }
): { ok: true; value: string } | { ok: false; error: string } {
  const value = (raw ?? "").trim();
  const min = opts.min ?? 1;
  const field = opts.field ?? "Field";
  if (value.length < min) return { ok: false, error: `${field} cannot be empty` };
  if (value.length > opts.max) return { ok: false, error: `${field} must be ${opts.max} characters or fewer` };
  return { ok: true, value };
}
