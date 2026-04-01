import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Megaphone, Calendar, UserCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

const typeConfig: Record<string, { icon: typeof Megaphone; label: string; color: string }> = {
  broadcast: { icon: Megaphone, label: "Announcement", color: "bg-primary/10 text-primary" },
  reminder: { icon: Bell, label: "Reminder", color: "bg-accent text-accent-foreground" },
  "event-invite": { icon: Calendar, label: "Event Invite", color: "bg-secondary/20 text-secondary-foreground" },
  direct: { icon: UserCheck, label: "Direct Message", color: "bg-secondary/20 text-secondary-foreground" },
};

interface Msg {
  id: string;
  content: string;
  message_type: string;
  created_at: string;
  author_name: string;
  read?: boolean;
  recipient_row_id?: string;
}

export default function RusheeMessages() {
  const { user } = useAuth();
  const [broadcasts, setBroadcasts] = useState<Msg[]>([]);
  const [directMsgs, setDirectMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      // Broadcasts
      const { data: bData } = await supabase.from("messages").select("*").order("created_at", { ascending: false });
      const authorIds = [...new Set((bData || []).map((m) => m.author_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", authorIds.length ? authorIds : ["_"]);
      const nameMap: Record<string, string> = {};
      (profiles || []).forEach((p) => { nameMap[p.user_id] = p.full_name; });
      setBroadcasts((bData || []).map((m) => ({
        id: m.id, content: m.content, message_type: m.message_type,
        created_at: m.created_at, author_name: nameMap[m.author_id] || "Chapter",
      })));

      // Direct messages to me
      const { data: recipientRows } = await supabase.from("direct_message_recipients").select("id, message_id, read").eq("recipient_id", user.id);
      if (recipientRows && recipientRows.length > 0) {
        const msgIds = (recipientRows as any[]).map((r: any) => r.message_id);
        const { data: dms } = await supabase.from("direct_messages").select("*").in("id", msgIds).order("created_at", { ascending: false });
        const senderIds = [...new Set((dms as any[] || []).map((d: any) => d.sender_id))];
        const { data: senderProfiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", senderIds.length ? senderIds : ["_"]);
        (senderProfiles || []).forEach((p) => { nameMap[p.user_id] = p.full_name; });
        const readMap: Record<string, { read: boolean; rowId: string }> = {};
        (recipientRows as any[]).forEach((r: any) => { readMap[r.message_id] = { read: r.read, rowId: r.id }; });
        setDirectMsgs((dms as any[] || []).map((d: any) => ({
          id: d.id, content: d.content, message_type: "direct",
          created_at: d.created_at, author_name: nameMap[d.sender_id] || "Chapter",
          read: readMap[d.id]?.read || false,
          recipient_row_id: readMap[d.id]?.rowId,
        })));
      }

      setLoading(false);
    };
    load();
  }, [user]);

  const markAsRead = async (msg: Msg) => {
    if (msg.read || !msg.recipient_row_id) return;
    await supabase.from("direct_message_recipients").update({ read: true, read_at: new Date().toISOString() } as any).eq("id", msg.recipient_row_id);
    setDirectMsgs((prev) => prev.map((m) => m.id === msg.id ? { ...m, read: true } : m));
  };

  const unreadCount = directMsgs.filter((m) => !m.read).length;
  const allMessages = [...broadcasts, ...directMsgs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (loading) return <div className="text-muted-foreground p-8">Loading messages…</div>;

  const renderMsg = (m: Msg) => {
    const cfg = typeConfig[m.message_type] || typeConfig.broadcast;
    const Icon = cfg.icon;
    const isUnread = m.message_type === "direct" && !m.read;
    return (
      <Card
        key={m.id + m.message_type}
        className={`p-4 bg-card shadow-warm transition-shadow hover:shadow-warm-lg ${isUnread ? "border-l-4 border-l-primary" : ""}`}
        onClick={() => m.message_type === "direct" && markAsRead(m)}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-foreground text-sm">{m.author_name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.color} flex items-center gap-1`}>
                <Icon className="w-3 h-3" />{cfg.label}
              </span>
              {isUnread && <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5">New</Badge>}
            </div>
            <p className="text-sm text-foreground mt-1.5">{m.content}</p>
            <p className="text-xs text-muted-foreground mt-2">{formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}</p>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Messages</h1>
        <p className="text-muted-foreground mt-1">
          Updates from chapters you're rushing.
          {unreadCount > 0 && <Badge className="ml-2 bg-primary text-primary-foreground">{unreadCount} new</Badge>}
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All ({allMessages.length})</TabsTrigger>
          <TabsTrigger value="direct">
            Direct {unreadCount > 0 && <Badge className="ml-1.5 bg-primary text-primary-foreground text-[10px] px-1.5">{unreadCount}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="broadcasts">Broadcasts ({broadcasts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4 space-y-3">
          {allMessages.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Megaphone className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>No messages yet — chapters will post updates here.</p>
            </div>
          )}
          {allMessages.map(renderMsg)}
        </TabsContent>

        <TabsContent value="direct" className="mt-4 space-y-3">
          {directMsgs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <UserCheck className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>No direct messages yet.</p>
            </div>
          ) : directMsgs.map(renderMsg)}
        </TabsContent>

        <TabsContent value="broadcasts" className="mt-4 space-y-3">
          {broadcasts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Megaphone className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>No broadcasts yet.</p>
            </div>
          ) : broadcasts.map(renderMsg)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
