import { useAuth } from "@/contexts/AuthContext";

/**
 * Returns true if the current chapter user has Premium write access.
 * - Platform admins: always true
 * - Rushees: always true (n/a)
 * - Chapter users: true only when subscribed
 * Defaults to true while subscription is loading to avoid flashing read-only.
 */
export function useChapterWriteAccess(): boolean {
  // Billing/subscription gating is disabled for now — everyone has full write access.
  return true;
}
