import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Megaphone, Calendar, UserCheck, Send, Loader2, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const typeConfig: Record<string, { icon: typeof Megaphone; label: string; color: string }> = {
  broadcast: { icon: Megaphone, label: "Announcement", color: "bg-primary/10 text-primary" },
  reminder: { icon: Bell, label: "Reminder", color: "bg-accent text-accent-foreground" },
  "event-invite": { icon: Calendar, label: "Event Invite", color: "bg-secondary/20 text-secondary-foreground" },
  direct: { icon: UserCheck, label: "Direct Message", color: "bg-secondary/20 text-secondary-foreground" },
};

interface Reply {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  created_at: string;
}

interface Msg {
  id: string;
  content: string;
  message_type: string;
  created_at: string;
  author_name: string;
  read?: boolean;
  recipient_row_id?: string;
  replies?: Reply[];
}

export default function RusheeMessages() {
  const { user } = useAuth();
  const [broadcasts, setBroadcasts] = useState<Msg[]>([]);
  const [directMsgs, setDirectMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replySending, setReplySending] = useState(false);
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());

  const load = async () => {
    if (!user) return;
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
      const { data: dms } = await supabase.from("direct_messages").select("*").is("reply_to" as any, null).in("id", msgIds).order("created_at", { ascending: false });
      const allSenderIds = new Set<string>();
      (dms as any[] || []).forEach((d: any) => allSenderIds.add(d.sender_id));

      // Fetch replies for these messages
      const dmIds = (dms as any[] || []).map((d: any) => d.id);
      const { data: replies } = dmIds.length > 0
        ? await supabase.from("direct_messages").select("*").in("reply_to" as any, dmIds).order("created_at", { ascending: true })
        : { data: [] };
      (replies as any[] || []).forEach((r: any) => allSenderIds.add(r.sender_id));

      const { data: senderProfiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", [...allSenderIds].length ? [...allSenderIds] : ["_"]);
      (senderProfiles || []).forEach((p) => { nameMap[p.user_id] = p.full_name; });

      const readMap: Record<string, { read: boolean; rowId: string }> = {};
      (recipientRows as any[]).forEach((r: any) => { readMap[r.message_id] = { read: r.read, rowId: r.id }; });

      const replyMap: Record<string, Reply[]> = {};
      (replies as any[] || []).forEach((r: any) => {
        const parentId = (r as any).reply_to;
        if (!replyMap[parentId]) replyMap[parentId] = [];
        replyMap[parentId].push({
          id: r.id, content: r.content, sender_id: r.sender_id,
          sender_name: nameMap[r.sender_id] || (r.sender_id === user.id ? "You" : "Chapter"),
          created_at: r.created_at,
        });
      });

      setDirectMsgs((dms as any[] || []).map((d: any) => ({
        id: d.id, content: d.content, message_type: "direct",
        created_at: d.created_at, author_name: nameMap[d.sender_id] || "Chapter",
        read: readMap[d.id]?.read || false,
        recipient_row_id: readMap[d.id]?.rowId,
        replies: replyMap[d.id] || [],
      })));
    }

    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const markAsRead = async (msg: Msg) => {
    if (msg.read || !msg.recipient_row_id) return;
    await supabase.from("direct_message_recipients").update({ read: true, read_at: new Date().toISOString() } as any).eq("id", msg.recipient_row_id);
    setDirectMsgs((prev) => prev.map((m) => m.id === msg.id ? { ...m, read: true } : m));
  };

  const handleReply = async (parentId: string) => {
    if (!replyText.trim() || !user) return;
    setReplySending(true);
    const { error } = await supabase.from("direct_messages").insert({
      sender_id: user.id, content: replyText, message_type: "direct", reply_to: parentId,
    } as any);
    setReplySending(false);
    if (error) { toast.error("Failed to send reply"); return; }
    toast.success("Reply sent!");
    setReplyText("");
    setReplyingTo(null);
    load();
  };

  const toggleThread = (msgId: string) => {
    setExpandedThreads((prev) => {
      const next = new Set(prev);
      if (next.has(msgId)) next.delete(msgId); else next.add(msgId);
      return next;
    });
  };

  const unreadCount = directMsgs.filter((m) => !m.read).length;
  const allMessages = [...broadcasts, ...directMsgs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (loading) return <div className="text-muted-foreground p-8">Loading messages…</div>;

  const renderMsg = (m: Msg) => {
    const cfg = typeConfig[m.message_type] || typeConfig.broadcast;
    const Icon = cfg.icon;
    const isUnread = m.message_type === "direct" && !m.read;
    const isDirect = m.message_type === "direct";
    const hasReplies = (m.replies?.length || 0) > 0;
    const isExpanded = expandedThreads.has(m.id);

    return (
      <Card
        key={m.id + m.message_type}
        className={`p-4 bg-card shadow-warm transition-shadow hover:shadow-warm-lg ${isUnread ? "border-l-4 border-l-primary" : ""}`}
        onClick={() => isDirect && markAsRead(m)}
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

            {isDirect && (
              <div className="mt-3 space-y-2">
                {/* Thread toggle */}
                {hasReplies && (
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleThread(m.id); }}
                    className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    {m.replies!.length} repl{m.replies!.length === 1 ? "y" : "ies"}
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                )}

                {/* Replies */}
                {isExpanded && m.replies?.map((r) => (
                  <div key={r.id} className="ml-4 pl-3 border-l-2 border-border py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground">
                        {r.sender_id === user?.id ? "You" : r.sender_name}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground mt-0.5">{r.content}</p>
                  </div>
                ))}

                {/* Reply input */}
                {replyingTo === m.id ? (
                  <div className="flex gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                    <Input
                      placeholder="Write a reply…"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleReply(m.id)}
                      className="flex-1 h-9 text-sm"
                      autoFocus
                    />
                    <Button size="sm" onClick={() => handleReply(m.id)} disabled={replySending || !replyText.trim()} className="gap-1.5">
                      {replySending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setReplyingTo(null); setReplyText(""); }}>Cancel</Button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); setReplyingTo(m.id); setExpandedThreads((p) => new Set(p).add(m.id)); }}
                    className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1.5 mt-1"
                  >
                    <Send className="w-3 h-3" /> Reply
                  </button>
                )}
              </div>
            )}
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
