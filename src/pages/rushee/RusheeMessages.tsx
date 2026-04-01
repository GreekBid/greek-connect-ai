import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Megaphone, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

const typeConfig: Record<string, { icon: typeof Megaphone; label: string; color: string }> = {
  broadcast: { icon: Megaphone, label: "Announcement", color: "bg-primary/10 text-primary" },
  reminder: { icon: Bell, label: "Reminder", color: "bg-accent text-accent-foreground" },
  "event-invite": { icon: Calendar, label: "Event Invite", color: "bg-secondary/20 text-secondary-foreground" },
};

interface Msg {
  id: string;
  content: string;
  message_type: string;
  created_at: string;
  author_name: string;
}

export default function RusheeMessages() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase.from("messages").select("*").order("created_at", { ascending: false });
      if (error) { console.error(error); setLoading(false); return; }

      // Get author names
      const authorIds = [...new Set((data || []).map((m) => m.author_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", authorIds);
      const nameMap: Record<string, string> = {};
      (profiles || []).forEach((p) => { nameMap[p.user_id] = p.full_name; });

      setMessages((data || []).map((m) => ({
        id: m.id,
        content: m.content,
        message_type: m.message_type,
        created_at: m.created_at,
        author_name: nameMap[m.author_id] || "Chapter",
      })));
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="text-muted-foreground p-8">Loading messages…</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Messages</h1>
        <p className="text-muted-foreground mt-1">
          Updates from chapters you're rushing.
          {messages.length > 0 && <Badge className="ml-2 bg-primary text-primary-foreground">{messages.length}</Badge>}
        </p>
      </div>

      {messages.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Megaphone className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No messages yet — chapters will post updates here.</p>
        </div>
      )}

      <div className="space-y-3">
        {messages.map((m) => {
          const cfg = typeConfig[m.message_type] || typeConfig.broadcast;
          const Icon = cfg.icon;
          return (
            <Card key={m.id} className="p-4 bg-card shadow-warm transition-shadow hover:shadow-warm-lg">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-foreground text-sm">{m.author_name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.color} flex items-center gap-1`}>
                      <Icon className="w-3 h-3" />
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-sm text-foreground mt-1.5">{m.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">{formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
