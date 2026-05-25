import { z } from "npm:zod@3.23.8";

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1).max(8000),
}).strict();

export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(50),
  model: z.string().max(120).optional(),
  rusheeContext: z.unknown().optional(),
}).passthrough();

export const checkoutRequestSchema = z.object({
  priceId: z.string().min(1).max(120).optional(),
  successUrl: z.string().url().max(2048).optional(),
  cancelUrl: z.string().url().max(2048).optional(),
}).strict().partial();

export const portalRequestSchema = z.object({
  returnUrl: z.string().url().max(2048).optional(),
}).strict().partial();

export const unsubscribeQuerySchema = z.object({
  token: z.string().min(8).max(256).regex(/^[A-Za-z0-9._\-]+$/, "Invalid token"),
});

export const previewEmailSchema = z.object({
  template: z.string().min(1).max(80).regex(/^[a-z0-9_\-]+$/i, "Invalid template"),
  to: z.string().email().max(255).optional(),
  variables: z.record(z.unknown()).optional(),
}).passthrough();

export const sendTransactionalSchema = z.object({
  template: z.string().min(1).max(80).regex(/^[a-z0-9_\-]+$/i),
  to: z.string().email().max(255),
  variables: z.record(z.unknown()).optional(),
  subject: z.string().max(255).optional(),
}).passthrough();

export function badRequest(error: unknown, corsHeaders: Record<string, string>) {
  const parsed = error instanceof z.ZodError ? error.flatten().fieldErrors : { _: ["Invalid request"] };
  return new Response(JSON.stringify({ error: parsed }), {
    status: 400,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
