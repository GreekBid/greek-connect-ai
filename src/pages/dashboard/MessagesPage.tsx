import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bell, Users, Search } from "lucide-react";
import { useState } from "react";

const mockMessages = [
  { id: 1, from: "Chapter", text: "Hey everyone! Don't forget about our Welcome BBQ this Friday at 5 PM. Dress casual and bring your appetite! 🎉", time: "Today, 2:30 PM", type: "broadcast" },
  { id: 2, from: "Chapter", text: "Reminder: Interest forms are due by Sunday night. Make sure all your info is complete.", time: "Today, 10:00 AM", type: "reminder" },
  { id: 3, from: "Chapter", text: "Great turnout at the Info Session yesterday! Keep an eye out for more event invites.", time: "Yesterday, 8:00 PM", type: "broadcast" },
  { id: 4, from: "Jake Martinez", text: "Thanks for the invite! Looking forward to the BBQ.", time: "Today, 3:15 PM", type: "direct" },
  { id: 5, from: "Emily Chen", text: "Can I bring a friend to Game Night?", time: "Today, 1:00 PM", type: "direct" },
];

export default function MessagesPage() {
  const [newMessage, setNewMessage] = useState("");

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Messages</h1>
          <p className="text-muted-foreground mt-1">Communicate with all rushees</p>
        </div>
        <Button variant="hero" size="sm" className="gap-2"><Bell className="w-4 h-4" /> Send Reminder</Button>
      </div>

      {/* Compose */}
      <Card className="p-5 bg-card shadow-warm">
        <h2 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" /> Broadcast to All Rushees
        </h2>
        <div className="flex gap-2">
          <Input placeholder="Type a message to all rushees..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="flex-1" />
          <Button variant="hero" size="default" className="gap-2"><Send className="w-4 h-4" /> Send</Button>
        </div>
      </Card>

      {/* Messages */}
      <div className="space-y-3">
        {mockMessages.map((m) => (
          <Card key={m.id} className={`p-4 ${m.type === "direct" ? "bg-card" : "bg-accent/50"} shadow-warm`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  {m.type === "broadcast" ? <Users className="w-4 h-4 text-primary" /> :
                   m.type === "reminder" ? <Bell className="w-4 h-4 text-primary" /> :
                   <span className="text-xs font-bold text-primary">{m.from[0]}</span>}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground text-sm">{m.from}</span>
                    {m.type === "broadcast" && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Broadcast</span>}
                    {m.type === "reminder" && <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">Reminder</span>}
                  </div>
                  <p className="text-sm text-foreground mt-1">{m.text}</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{m.time}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
