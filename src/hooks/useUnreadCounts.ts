import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UnreadCounts {
  messages: number;
  events: number;
  bids: number;
}

export function useRusheeUnreadCounts() {
  const { user } = useAuth();
  const [counts, setCounts] = useState<UnreadCounts>({ messages: 0, events: 0, bids: 0 });

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      // Unread direct messages
      const { count: unreadMsgs } = await supabase
        .from("direct_message_recipients")
        .select("*", { count: "exact", head: true })
        .eq("recipient_id", user.id)
        .eq("read", false);

      // Upcoming events (next 7 days)
      const now = new Date();
      const week = new Date(now.getTime() + 7 * 86400000);
      const { count: upcomingEvents } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .gte("date", now.toISOString().split("T")[0])
        .lte("date", week.toISOString().split("T")[0]);

      // Active bids
      const { count: activeBids } = await supabase
        .from("bids")
        .select("*", { count: "exact", head: true })
        .eq("rushee_id", user.id)
        .in("status", ["bid_extended", "under_review"]);

      setCounts({
        messages: unreadMsgs || 0,
        events: upcomingEvents || 0,
        bids: activeBids || 0,
      });
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [user]);

  return counts;
}

export function useChapterUnreadCounts() {
  const { user } = useAuth();
  const [counts, setCounts] = useState<{ replies: number; pendingBids: number }>({ replies: 0, pendingBids: 0 });

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      // Pending bids
      const { count: pendingBids } = await supabase
        .from("bids")
        .select("*", { count: "exact", head: true })
        .eq("status", "under_review");

      setCounts({
        replies: 0,
        pendingBids: pendingBids || 0,
      });
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [user]);

  return counts;
}
