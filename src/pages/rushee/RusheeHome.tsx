import { Card } from "@/components/ui/card";
import { Calendar, MapPin, Clock, CheckCircle, MessageSquare, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export default function RusheeHome() {
  const { user } = useAuth();
  const name = user?.user_metadata?.full_name || "there";
  const [stats, setStats] = useState({ events: 0, rsvps: 0, messages: 0 });
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data: events } = await supabase.from("events").select("*").gte("date", today).order("date").limit(3);
      const { data: rsvps } = await supabase.from("event_rsvps").select("event_id").eq("user_id", user.id);
      const { count: msgCount } = await supabase.from("messages").select("*", { count: "exact", head: true });

      const rsvpIds = new Set((rsvps || []).map((r) => r.event_id));
      setUpcomingEvents((events || []).map((e) => ({ ...e, rsvpd: rsvpIds.has(e.id) })));
      setStats({ events: (events || []).length, rsvps: (rsvps || []).length, messages: msgCount || 0 });
    };
    fetchData();
  }, [user]);

  const tips = [
    "Be yourself — chapters value authenticity over performance.",
    "Prepare 2-3 questions to ask brothers/sisters about their experience.",
    "Follow up with a thank-you message after events you attend.",
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Hey, {name}! 👋</h1>
        <p className="text-muted-foreground mt-1">Here's your personalized rush overview.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-5 bg-card shadow-warm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center"><Calendar className="w-5 h-5 text-primary" /></div>
            <div>
              <p className="text-2xl font-display font-bold text-foreground">{stats.events}</p>
              <p className="text-sm text-muted-foreground">Upcoming Events</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-card shadow-warm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center"><CheckCircle className="w-5 h-5 text-primary" /></div>
            <div>
              <p className="text-2xl font-display font-bold text-foreground">{stats.rsvps}</p>
              <p className="text-sm text-muted-foreground">RSVPs Confirmed</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-card shadow-warm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center"><MessageSquare className="w-5 h-5 text-primary" /></div>
            <div>
              <p className="text-2xl font-display font-bold text-foreground">{stats.messages}</p>
              <p className="text-sm text-muted-foreground">Messages</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-card shadow-warm">
        <h2 className="font-display font-semibold text-foreground text-lg mb-4">Your Rush Schedule</h2>
        {upcomingEvents.length === 0 ? (
          <p className="text-muted-foreground text-sm">No upcoming events yet — check the Events tab!</p>
        ) : (
          <div className="space-y-4">
            {upcomingEvents.map((e) => {
              const dateObj = new Date(e.date + "T00:00:00");
              return (
                <div key={e.id} className="flex items-start gap-4 p-4 rounded-lg bg-accent/40">
                  <div className="text-center shrink-0">
                    <p className="text-xs text-muted-foreground font-medium">{format(dateObj, "MMM")}</p>
                    <p className="text-lg font-display font-bold text-foreground">{format(dateObj, "d")}</p>
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-display font-semibold text-foreground">{e.name}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{e.time}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{e.location}</span>
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{e.vibe || "Casual"}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-medium ${e.rsvpd ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {e.rsvpd ? "RSVP'd ✓" : "Not RSVP'd"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>

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
