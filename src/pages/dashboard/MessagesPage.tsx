import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bell, Users, Megaphone, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Msg {
  id: string;
  content: string;
  message_type: string;
  created_at: string;
  author_name: string;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [msgType, setMsgType] = useState("broadcast");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    const { data, error } = await supabase.from("messages").select("*").order("created_at", { ascending: false });
    if (error) { console.error(error); setLoading(false); return; }
    const authorIds = [...new Set((data || []).map((m) => m.author_id))];
    const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", authorIds);
    const nameMap: Record<string, string> = {};
    (profiles || []).forEach((p) => { nameMap[p.user_id] = p.full_name; });
    setMessages((data || []).map((m) => ({
      id: m.id, content: m.content, message_type: m.message_type,
      created_at: m.created_at, author_name: nameMap[m.author_id] || "Unknown",
    })));
    setLoading(false);
  };

  useEffect(() => { fetchMessages(); }, []);

  const handleSend = async () => {
    if (!newMessage.trim() || !user) return;
    setSending(true);
    const { error } = await supabase.from("messages").insert({
      author_id: user.id,
      content: newMessage,
      message_type: msgType,
    });
    setSending(false);
    if (error) { toast.error("Failed to send message"); return; }
    toast.success("Message sent to all rushees!");
    setNewMessage("");
    fetchMessages();
  };

  if (loading) return <div className="text-muted-foreground p-8">Loading messages…</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Messages</h1>
        <p className="text-muted-foreground mt-1">Communicate with all rushees</p>
      </div>

      <Card className="p-5 bg-card shadow-warm">
        <h2 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" /> Broadcast to All Rushees
        </h2>
        <div className="flex gap-2">
          <Input placeholder="Type a message to all rushees..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()} className="flex-1" />
          <Select value={msgType} onValueChange={setMsgType}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="broadcast">Announcement</SelectItem>
              <SelectItem value="reminder">Reminder</SelectItem>
              <SelectItem value="event-invite">Event Invite</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="hero" size="default" onClick={handleSend} disabled={sending} className="gap-2">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </Card>

      {messages.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Megaphone className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No messages yet — send your first broadcast!</p>
        </div>
      )}

      <div className="space-y-3">
        {messages.map((m) => (
          <Card key={m.id} className={`p-4 ${m.message_type === "broadcast" ? "bg-accent/50" : "bg-card"} shadow-warm`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  {m.message_type === "broadcast" ? <Megaphone className="w-4 h-4 text-primary" /> :
                   m.message_type === "reminder" ? <Bell className="w-4 h-4 text-primary" /> :
                   <Users className="w-4 h-4 text-primary" />}
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
      </div>
    </div>
  );
}
