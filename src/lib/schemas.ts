import { z } from "zod";
import { toast } from "sonner";

/**
 * Central zod schemas for all user input.
 * Use `parseOrToast(schema, data)` in forms to validate-then-write.
 */

// ---- primitives ----
const trimmed = (max: number, min = 1) =>
  z.string().trim().min(min, "Required").max(max, `Must be ${max} characters or fewer`);

const optionalTrimmed = (max: number) =>
  z.string().trim().max(max, `Must be ${max} characters or fewer`).optional().or(z.literal(""));

const handle = z
  .string()
  .trim()
  .max(30, "Handle too long")
  .regex(/^[a-zA-Z0-9._-]*$/, "Only letters, numbers, dots, underscores, hyphens")
  .transform((v) => v.replace(/^@+/, ""))
  .optional()
  .or(z.literal(""));

const uuid = z.string().uuid("Invalid id");

export const LIMITS = {
  message: 2000,
  bio: 500,
  shortText: 100,
  eventDescription: 1000,
  noteContent: 2000,
} as const;

// ---- auth ----
export const emailSchema = z.string().trim().toLowerCase().email("Invalid email").max(255);
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password too long");

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  full_name: trimmed(80),
  role: z.enum(["rushee", "chapter", "admin"]),
  college: optionalTrimmed(120),
  gender: z.enum(["male", "female", ""]).optional(),
  org_type: z.enum(["fraternity", "sorority", ""]).optional(),
}).strict();

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required").max(72),
}).strict();

export const forgotPasswordSchema = z.object({ email: emailSchema }).strict();

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .strict()
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ---- profile ----
export const profileUpdateSchema = z.object({
  full_name: trimmed(80).optional(),
  bio: optionalTrimmed(LIMITS.bio),
  major: optionalTrimmed(80),
  hometown: optionalTrimmed(80),
  college: optionalTrimmed(120),
  instagram: handle,
  snapchat: handle,
  tiktok: handle,
  twitter: handle,
  linkedin: z.string().trim().max(100).optional().or(z.literal("")),
  interests: z.array(trimmed(40)).max(20, "Up to 20 interests").optional(),
  avatar_url: z.string().url().max(1024).optional().or(z.literal("")).nullable(),
  gender: z.enum(["male", "female", ""]).optional(),
  org_type: z.enum(["fraternity", "sorority", ""]).optional(),
}).strict().partial();

// ---- chapter ----
export const chapterSchema = z.object({
  name: trimmed(100, 2),
  college: trimmed(120, 2),
  org_type: z.enum(["fraternity", "sorority"]),
}).strict();

// ---- event ----
export const eventSchema = z.object({
  name: trimmed(120, 2),
  description: optionalTrimmed(LIMITS.eventDescription),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Invalid time"),
  location: optionalTrimmed(200),
  capacity: z.coerce.number().int().min(1).max(10000).optional(),
  vibe: optionalTrimmed(40),
  attire: optionalTrimmed(40),
  status: z.enum(["upcoming", "ongoing", "completed", "cancelled"]).optional(),
}).strict();

// ---- messages ----
export const messageSchema = z.object({
  content: trimmed(LIMITS.message),
  message_type: z.enum(["broadcast", "direct", "announcement"]).optional(),
}).strict();

export const directMessageSchema = z.object({
  content: trimmed(LIMITS.message),
  recipient_ids: z.array(uuid).min(1, "Pick at least one recipient").max(500),
  reply_to: uuid.optional().nullable(),
}).strict();

// ---- notes ----
export const noteSchema = z.object({
  content: trimmed(LIMITS.noteContent),
  subject_id: uuid,
  subject_type: z.enum(["rushee", "event", "chapter"]),
}).strict();

// ---- bids / rankings ----
export const bidSchema = z.object({
  rushee_id: uuid,
  status: z.enum(["under_review", "extended", "accepted", "declined", "rescinded"]),
  notes: optionalTrimmed(1000),
}).strict();

export const rankingSchema = z.object({
  rushee_id: uuid,
  vote: z.enum(["yes", "maybe", "no"]),
}).strict();

// ---- helpers ----
export interface ParseSuccess<T> { ok: true; data: T; error?: undefined; fieldErrors?: undefined }
export interface ParseFailure { ok: false; data?: undefined; error: string; fieldErrors: Record<string, string[]> }
export type ParseResult<T> = ParseSuccess<T> | ParseFailure;

export function parse<T>(schema: z.ZodType<T>, data: unknown): ParseResult<T> {
  const r = schema.safeParse(data);
  if (r.success) return { ok: true, data: r.data };
  const fieldErrors = r.error.flatten().fieldErrors as Record<string, string[]>;
  const first =
    Object.values(fieldErrors).flat()[0] ||
    r.error.issues[0]?.message ||
    "Invalid input";
  return { ok: false, error: first, fieldErrors };
}

export function parseOrToast<T>(schema: z.ZodType<T>, data: unknown): T | null {
  const r = parse(schema, data);
  if (r.ok) return r.data as T;
  toast.error(r.error ?? "Invalid input");
  return null;
}

