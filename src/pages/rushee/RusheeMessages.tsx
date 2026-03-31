import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Bell, Megaphone, Calendar } from "lucide-react";

interface Message {
  id: string;
  from: string;
  org: string;
  text: string;
  time: string;
  type: "broadcast" | "reminder" | "event-invite";
  read: boolean;
}

const mockMessages: Message[] = [
  { id: "1", from: "Alpha Beta Gamma", org: "ABG", text: "Hey everyone! Don't forget about our Welcome BBQ this Friday at 5 PM. Dress casual and bring your appetite! 🎉", time: "Today, 2:30 PM", type: "broadcast", read: false },
  { id: "2", from: "Alpha Beta Gamma", org: "ABG", text: "Reminder: Interest forms are due by Sunday night. Make sure your profile is 100% complete — chapters are reviewing them!", time: "Today, 10:00 AM", type: "reminder", read: false },
  { id: "3", from: "Delta Epsilon", org: "DE", text: "You're invited to our Game Night this Saturday! Mario Kart, board games, and snacks. RSVP in the Events tab.", time: "Yesterday, 6:00 PM", type: "event-invite", read: true },
  { id: "4", from: "Alpha Beta Gamma", org: "ABG", text: "Great turnout at the Info Session yesterday! Keep an eye out for more event invites coming soon.", time: "Yesterday, 8:00 PM", type: "broadcast", read: true },
  { id: "5", from: "Kappa Sigma", org: "KΣ", text: "Community Service Day is April 8th at City Park. Join us to give back and hang with the brothers. Wear comfortable clothes!", time: "2 days ago", type: "event-invite", read: true },
  { id: "6", from: "Phi Delta Theta", org: "ΦΔΘ", text: "Reminder: Our casual Study & Chill session is next Wednesday at 3 PM in the Library Lounge. Come say hi!", time: "3 days ago", type: "reminder", read: true },
];

const typeConfig = {
  broadcast: { icon: Megaphone, label: "Announcement", color: "bg-primary/10 text-primary" },
  reminder: { icon: Bell, label: "Reminder", color: "bg-accent text-accent-foreground" },
  "event-invite": { icon: Calendar, label: "Event Invite", color: "bg-secondary/20 text-secondary-foreground" },
};

export default function RusheeMessages() {
  const unread = mockMessages.filter((m) => !m.read).length;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Messages</h1>
        <p className="text-muted-foreground mt-1">
          Updates from chapters you're rushing.
          {unread > 0 && <Badge className="ml-2 bg-primary text-primary-foreground">{unread} new</Badge>}
        </p>
      </div>

      <div className="space-y-3">
        {mockMessages.map((m) => {
          const cfg = typeConfig[m.type];
          const Icon = cfg.icon;
          return (
            <Card
              key={m.id}
              className={`p-4 bg-card shadow-warm transition-shadow hover:shadow-warm-lg ${!m.read ? "border-l-4 border-l-primary" : ""}`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                  <span className="font-display font-bold text-primary text-xs">{m.org}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-foreground text-sm">{m.from}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.color} flex items-center gap-1`}>
                      <Icon className="w-3 h-3" />
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-sm text-foreground mt-1.5">{m.text}</p>
                  <p className="text-xs text-muted-foreground mt-2">{m.time}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
