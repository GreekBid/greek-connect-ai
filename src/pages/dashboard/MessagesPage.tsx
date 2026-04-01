import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, Bell, Users, Megaphone, Loader2, UserCheck, X, Search, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  recipients?: string[];
  replies?: Reply[];
}

interface RusheeOption {
  user_id: string;
  full_name: string;
  major: string | null;
  avatar_url: string | null;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [broadcasts, setBroadcasts] = useState<Msg[]>([]);
  const [directMsgs, setDirectMsgs] = useState<Msg[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [msgType, setMsgType] = useState("broadcast");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("broadcast");
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replySending, setReplySending] = useState(false);

  // Direct message state
  const [dmDialogOpen, setDmDialogOpen] = useState(false);
  const [dmContent, setDmContent] = useState("");
  const [rushees, setRushees] = useState<RusheeOption[]>([]);
  const [selectedRushees, setSelectedRushees] = useState<Set<string>>(new Set());
  const [rusheeSearch, setRusheeSearch] = useState("");
  const [dmSending, setDmSending] = useState(false);

  const nameMap: Record<string, string> = {};

  const fetchMessages = async () => {
    // Broadcasts
    const { data } = await supabase.from("messages").select("*").order("created_at", { ascending: false });
    const authorIds = [...new Set((data || []).map((m) => m.author_id))];
    const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", authorIds.length ? authorIds : ["_"]);
    (profiles || []).forEach((p) => { nameMap[p.user_id] = p.full_name; });
    setBroadcasts((data || []).map((m) => ({
      id: m.id, content: m.content, message_type: m.message_type,
      created_at: m.created_at, author_name: nameMap[m.author_id] || "Unknown",
    })));

    // Direct messages (top-level only)
    const { data: dms } = await (supabase.from("direct_messages").select("*") as any).is("reply_to", null).order("created_at", { ascending: false });
    if (dms && dms.length > 0) {
      const dmIds = (dms as any[]).map((d: any) => d.id);
      const { data: recipients } = await supabase.from("direct_message_recipients").select("message_id, recipient_id").in("message_id", dmIds);
      const recipientMap: Record<string, string[]> = {};
      (recipients as any[] || []).forEach((r: any) => {
        if (!recipientMap[r.message_id]) recipientMap[r.message_id] = [];
        recipientMap[r.message_id].push(r.recipient_id);
      });

      // Fetch replies
      const { data: replies } = await supabase.from("direct_messages").select("*").in("reply_to" as any, dmIds).order("created_at", { ascending: true });

      const allUserIds = new Set<string>();
      (dms as any[]).forEach((d: any) => allUserIds.add(d.sender_id));
      Object.values(recipientMap).flat().forEach((id) => allUserIds.add(id));
      (replies as any[] || []).forEach((r: any) => allUserIds.add(r.sender_id));

      const { data: allProfiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", [...allUserIds].length ? [...allUserIds] : ["_"]);
      (allProfiles || []).forEach((p) => { nameMap[p.user_id] = p.full_name; });

      const replyMap: Record<string, Reply[]> = {};
      (replies as any[] || []).forEach((r: any) => {
        const parentId = (r as any).reply_to;
        if (!replyMap[parentId]) replyMap[parentId] = [];
        replyMap[parentId].push({
          id: r.id, content: r.content, sender_id: r.sender_id,
          sender_name: nameMap[r.sender_id] || "Unknown",
          created_at: r.created_at,
        });
      });

      setDirectMsgs((dms as any[]).map((d: any) => ({
        id: d.id, content: d.content, message_type: d.message_type,
        created_at: d.created_at, author_name: nameMap[d.sender_id] || "Unknown",
        recipients: (recipientMap[d.id] || []).map((rid) => nameMap[rid] || "Unknown"),
        replies: replyMap[d.id] || [],
      })));
    }

    setLoading(false);
  };

  const fetchRushees = async () => {
    const { data } = await supabase.from("profiles").select("user_id, full_name, major, avatar_url").eq("role", "rushee");
    setRushees(data || []);
  };

  useEffect(() => { fetchMessages(); fetchRushees(); }, []);

  const handleBroadcast = async () => {
    if (!newMessage.trim() || !user) return;
    setSending(true);
    const { error } = await supabase.from("messages").insert({ author_id: user.id, content: newMessage, message_type: msgType });
    setSending(false);
    if (error) { toast.error("Failed to send"); return; }
    toast.success("Broadcast sent to all rushees!");
    setNewMessage("");
    fetchMessages();
  };

  const handleDirectSend = async () => {
    if (!dmContent.trim() || selectedRushees.size === 0 || !user) return;
    setDmSending(true);

    const { data: dm, error: dmErr } = await supabase.from("direct_messages").insert({
      sender_id: user.id, content: dmContent, message_type: "direct",
    } as any).select("id").single();

    if (dmErr || !dm) { toast.error("Failed to send"); setDmSending(false); return; }

    const recipients = Array.from(selectedRushees).map((rid) => ({
      message_id: (dm as any).id, recipient_id: rid,
    }));
    const { error: recErr } = await supabase.from("direct_message_recipients").insert(recipients as any);

    setDmSending(false);
    if (recErr) { toast.error("Failed to add recipients"); return; }

    const count = selectedRushees.size;
    toast.success(`Message sent to ${count} rushee${count > 1 ? "s" : ""}!`);
    setDmContent("");
    setSelectedRushees(new Set());
    setDmDialogOpen(false);
    fetchMessages();
  };

  const handleChapterReply = async (parentId: string) => {
    if (!replyText.trim() || !user) return;
    setReplySending(true);
    // Chapter replies: insert as direct_message with reply_to (no RLS issue since chapter has insert policy)
    const { error } = await supabase.from("direct_messages").insert({
      sender_id: user.id, content: replyText, message_type: "direct", reply_to: parentId,
    } as any);
    setReplySending(false);
    if (error) { toast.error("Failed to send reply"); return; }
    toast.success("Reply sent!");
    setReplyText("");
    setReplyingTo(null);
    fetchMessages();
  };

  const toggleRushee = (userId: string) => {
    setSelectedRushees((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId); else next.add(userId);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedRushees.size === filteredRushees.length) setSelectedRushees(new Set());
    else setSelectedRushees(new Set(filteredRushees.map((r) => r.user_id)));
  };

  const toggleThread = (msgId: string) => {
    setExpandedThreads((prev) => {
      const next = new Set(prev);
      if (next.has(msgId)) next.delete(msgId); else next.add(msgId);
      return next;
    });
  };

  const filteredRushees = rushees.filter((r) => r.full_name.toLowerCase().includes(rusheeSearch.toLowerCase()));

  if (loading) return <div className="text-muted-foreground p-8">Loading messages…</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Messages</h1>
          <p className="text-muted-foreground mt-1">Communicate with rushees — broadcast or targeted</p>
        </div>
        <Dialog open={dmDialogOpen} onOpenChange={setDmDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><UserCheck className="w-4 h-4" /> Message Select Rushees</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
            <DialogHeader><DialogTitle>Send to Specific Rushees</DialogTitle></DialogHeader>
            <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
              <Textarea placeholder="Type your message…" value={dmContent} onChange={(e) => setDmContent(e.target.value)} rows={3} />

              {selectedRushees.size > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {Array.from(selectedRushees).map((id) => {
                    const r = rushees.find((x) => x.user_id === id);
                    return (
                      <Badge key={id} variant="secondary" className="gap-1 pr-1">
                        {r?.full_name || "Unknown"}
                        <button onClick={() => toggleRushee(id)} className="ml-1 hover:text-destructive"><X className="w-3 h-3" /></button>
                      </Badge>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search rushees…" className="pl-9" value={rusheeSearch} onChange={(e) => setRusheeSearch(e.target.value)} />
                </div>
                <Button variant="outline" size="sm" onClick={selectAll}>
                  {selectedRushees.size === filteredRushees.length ? "Deselect All" : "Select All"}
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1 max-h-48 border rounded-lg p-2">
                {filteredRushees.map((r) => (
                  <label key={r.user_id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors">
                    <Checkbox checked={selectedRushees.has(r.user_id)} onCheckedChange={() => toggleRushee(r.user_id)} />
                    <Avatar className="w-7 h-7">
                      <AvatarImage src={r.avatar_url || undefined} />
                      <AvatarFallback className="text-xs bg-accent">{r.full_name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{r.full_name}</p>
                      <p className="text-xs text-muted-foreground">{r.major || "Undeclared"}</p>
                    </div>
                  </label>
                ))}
                {filteredRushees.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No rushees found</p>}
              </div>

              <Button className="w-full gap-2" onClick={handleDirectSend} disabled={dmSending || !dmContent.trim() || selectedRushees.size === 0}>
                {dmSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send to {selectedRushees.size} Rushee{selectedRushees.size !== 1 ? "s" : ""}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Broadcast composer */}
      <Card className="p-5 bg-card shadow-warm">
        <h2 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
          <Megaphone className="w-4 h-4" /> Broadcast to All Rushees
        </h2>
        <div className="flex gap-2">
          <Input placeholder="Type a message to all rushees..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleBroadcast()} className="flex-1" />
          <Select value={msgType} onValueChange={setMsgType}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="broadcast">Announcement</SelectItem>
              <SelectItem value="reminder">Reminder</SelectItem>
              <SelectItem value="event-invite">Event Invite</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="hero" onClick={handleBroadcast} disabled={sending} className="gap-2">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </Card>

      {/* Message tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="broadcast">Broadcasts ({broadcasts.length})</TabsTrigger>
          <TabsTrigger value="direct">Direct ({directMsgs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="broadcast" className="mt-4 space-y-3">
          {broadcasts.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Megaphone className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>No broadcasts yet — send your first one!</p>
            </div>
          )}
          {broadcasts.map((m) => (
            <Card key={m.id} className="p-4 bg-card shadow-warm">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    {m.message_type === "reminder" ? <Bell className="w-4 h-4 text-primary" /> :
                     m.message_type === "event-invite" ? <Users className="w-4 h-4 text-primary" /> :
                     <Megaphone className="w-4 h-4 text-primary" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground text-sm">{m.author_name}</span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full capitalize">{m.message_type.replace("-", " ")}</span>
                    </div>
                    <p className="text-sm text-foreground mt-1">{m.content}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}</span>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="direct" className="mt-4 space-y-3">
          {directMsgs.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <UserCheck className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>No direct messages yet — click "Message Select Rushees" to start.</p>
            </div>
          )}
          {directMsgs.map((m) => {
            const hasReplies = (m.replies?.length || 0) > 0;
            const isExpanded = expandedThreads.has(m.id);

            return (
              <Card key={m.id} className="p-4 bg-card shadow-warm">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-secondary/30 flex items-center justify-center shrink-0">
                      <UserCheck className="w-4 h-4 text-secondary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground text-sm">{m.author_name}</span>
                        <span className="text-xs bg-secondary/20 text-secondary-foreground px-2 py-0.5 rounded-full">Direct</span>
                        <span className="text-xs text-muted-foreground">→ {m.recipients?.join(", ")}</span>
                      </div>
                      <p className="text-sm text-foreground mt-1">{m.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}</p>

                      {/* Thread */}
                      <div className="mt-3 space-y-2">
                        {hasReplies && (
                          <button
                            onClick={() => toggleThread(m.id)}
                            className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            {m.replies!.length} repl{m.replies!.length === 1 ? "y" : "ies"}
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        )}

                        {isExpanded && m.replies?.map((r) => (
                          <div key={r.id} className="ml-4 pl-3 border-l-2 border-border py-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-foreground">{r.sender_name}</span>
                              <span className="text-[10px] text-muted-foreground">
                                {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-sm text-foreground mt-0.5">{r.content}</p>
                          </div>
                        ))}

                        {/* Reply input */}
                        {replyingTo === m.id ? (
                          <div className="flex gap-2 mt-2">
                            <Input
                              placeholder="Write a reply…"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && handleChapterReply(m.id)}
                              className="flex-1 h-9 text-sm"
                              autoFocus
                            />
                            <Button size="sm" onClick={() => handleChapterReply(m.id)} disabled={replySending || !replyText.trim()} className="gap-1.5">
                              {replySending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => { setReplyingTo(null); setReplyText(""); }}>Cancel</Button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setReplyingTo(m.id); setExpandedThreads((p) => new Set(p).add(m.id)); }}
                            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1.5 mt-1"
                          >
                            <Send className="w-3 h-3" /> Reply
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
