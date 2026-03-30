import { Card } from "@/components/ui/card";
import { Calendar, MapPin, Clock, CheckCircle, MessageSquare, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const upcomingEvents = [
  { name: "Meet & Greet BBQ", org: "Alpha Beta Gamma", date: "Apr 4", time: "5:00 PM", location: "Greek Row Lawn", vibe: "Casual — shorts & a tee", rsvpd: true },
  { name: "Game Night", org: "Delta Epsilon", date: "Apr 5", time: "7:00 PM", location: "Student Union Rm 204", vibe: "Relaxed — come as you are", rsvpd: false },
  { name: "Formal Dinner", org: "Alpha Beta Gamma", date: "Apr 7", time: "6:30 PM", location: "Chapter House", vibe: "Business casual", rsvpd: false },
];

const tips = [
  "Be yourself — chapters value authenticity over performance.",
  "Prepare 2-3 questions to ask brothers/sisters about their experience.",
  "Follow up with a thank-you message after events you attend.",
];

export default function RusheeHome() {
  const { user } = useAuth();
  const name = user?.user_metadata?.full_name || "there";

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Hey, {name}! 👋</h1>
        <p className="text-muted-foreground mt-1">Here's your personalized rush overview.</p>
      </div>

      {/* Status */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-5 bg-card shadow-warm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-foreground">3</p>
              <p className="text-sm text-muted-foreground">Upcoming Events</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-card shadow-warm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-foreground">1</p>
              <p className="text-sm text-muted-foreground">RSVPs Confirmed</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-card shadow-warm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-foreground">2</p>
              <p className="text-sm text-muted-foreground">New Messages</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Schedule */}
      <Card className="p-6 bg-card shadow-warm">
        <h2 className="font-display font-semibold text-foreground text-lg mb-4">Your Rush Schedule</h2>
        <div className="space-y-4">
          {upcomingEvents.map((e) => (
            <div key={e.name} className="flex items-start gap-4 p-4 rounded-lg bg-accent/40">
              <div className="text-center shrink-0">
                <p className="text-xs text-muted-foreground font-medium">{e.date.split(" ")[0]}</p>
                <p className="text-lg font-display font-bold text-foreground">{e.date.split(" ")[1]}</p>
              </div>
              <div className="flex-1 space-y-1">
                <p className="font-display font-semibold text-foreground">{e.name}</p>
                <p className="text-sm text-primary font-medium">{e.org}</p>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{e.time}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{e.location}</span>
                  <span className="flex items-center gap-1"><User className="w-3 h-3" />{e.vibe}</span>
                </div>
              </div>
              <button className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${e.rsvpd ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground"}`}>
                {e.rsvpd ? "RSVP'd ✓" : "RSVP"}
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Tips */}
      <Card className="p-6 bg-card shadow-warm">
        <h2 className="font-display font-semibold text-foreground text-lg mb-4">💡 Rush Tips</h2>
        <ul className="space-y-3">
          {tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
              <p className="text-foreground">{tip}</p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
