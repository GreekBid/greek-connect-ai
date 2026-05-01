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
      const now = new Date();
      const week = new Date(now.getTime() + 7 * 86400000);

      const [{ count: unreadMsgs }, { count: upcomingEvents }, { count: activeBids }] = await Promise.all([
        supabase
          .from("direct_message_recipients")
          .select("*", { count: "exact", head: true })
          .eq("recipient_id", user.id)
          .eq("read", false),
        supabase
          .from("events")
          .select("*", { count: "exact", head: true })
          .gte("date", now.toISOString().split("T")[0])
          .lte("date", week.toISOString().split("T")[0]),
        supabase
          .from("bids")
          .select("*", { count: "exact", head: true })
          .eq("rushee_id", user.id)
          .in("status", ["bid_extended", "under_review"]),
      ]);

      setCounts({
        messages: unreadMsgs || 0,
        events: upcomingEvents || 0,
        bids: activeBids || 0,
      });
    };

    load();

    const channel = supabase
      .channel(`rushee-unread-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "direct_message_recipients", filter: `recipient_id=eq.${user.id}` },
        load
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "events" }, load)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bids", filter: `rushee_id=eq.${user.id}` },
        load
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return counts;
}

export function useChapterUnreadCounts() {
  const { user } = useAuth();
  const [counts, setCounts] = useState<{ replies: number; pendingBids: number }>({ replies: 0, pendingBids: 0 });

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const { count: pendingBids } = await supabase
        .from("bids")
        .select("*", { count: "exact", head: true })
        .eq("status", "under_review");

      setCounts({ replies: 0, pendingBids: pendingBids || 0 });
    };

    load();

    const channel = supabase
      .channel(`chapter-unread-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "bids" }, load)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return counts;
}
