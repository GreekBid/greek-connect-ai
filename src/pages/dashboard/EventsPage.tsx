import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Users, Plus } from "lucide-react";

const mockEvents = [
  { id: 1, name: "Welcome BBQ", date: "Apr 4, 2026", time: "5:00 PM", location: "Chapter House Backyard", rsvps: 35, capacity: 50, vibe: "Casual", attire: "Shorts & tees", status: "upcoming" },
  { id: 2, name: "Game Night", date: "Apr 6, 2026", time: "7:00 PM", location: "Student Union Room 204", rsvps: 22, capacity: 30, vibe: "Relaxed", attire: "Anything goes", status: "upcoming" },
  { id: 3, name: "Formal Dinner", date: "Apr 10, 2026", time: "6:30 PM", location: "The Grand Hall", rsvps: 28, capacity: 40, vibe: "Professional", attire: "Business casual", status: "upcoming" },
  { id: 4, name: "Community Service Day", date: "Apr 12, 2026", time: "9:00 AM", location: "City Park", rsvps: 18, capacity: 25, vibe: "Active", attire: "Comfortable", status: "upcoming" },
  { id: 5, name: "Info Session", date: "Mar 28, 2026", time: "4:00 PM", location: "Chapter House", rsvps: 42, capacity: 50, vibe: "Informative", attire: "Casual", status: "past" },
];

const staffing = [
  { role: "Greeters", needed: 3, assigned: 2 },
  { role: "Drivers", needed: 2, assigned: 1 },
  { role: "Sober Monitors", needed: 2, assigned: 2 },
  { role: "Interviewers", needed: 4, assigned: 3 },
];

export default function EventsPage() {
  const upcoming = mockEvents.filter((e) => e.status === "upcoming");
  const past = mockEvents.filter((e) => e.status === "past");

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Events</h1>
          <p className="text-muted-foreground mt-1">{upcoming.length} upcoming events</p>
        </div>
        <Button variant="hero" size="sm" className="gap-2"><Plus className="w-4 h-4" /> Create Event</Button>
      </div>

      {/* Staffing panel */}
      <Card className="p-5 bg-card shadow-warm">
        <h2 className="font-display font-semibold text-foreground mb-3">Next Event Staffing — Welcome BBQ</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {staffing.map((s) => (
            <div key={s.role} className="p-3 rounded-lg bg-accent">
              <p className="text-sm font-medium text-accent-foreground">{s.role}</p>
              <p className="text-lg font-display font-bold text-foreground">{s.assigned}/{s.needed}</p>
              {s.assigned < s.needed && <Badge variant="destructive" className="text-xs mt-1">Needs {s.needed - s.assigned} more</Badge>}
            </div>
          ))}
        </div>
      </Card>

      <div className="space-y-4">
        <h2 className="font-display font-semibold text-foreground text-lg">Upcoming</h2>
        {upcoming.map((e) => (
          <Card key={e.id} className="p-5 bg-card shadow-warm hover:shadow-warm-lg transition-shadow">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <h3 className="font-display font-semibold text-foreground text-lg">{e.name}</h3>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {e.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {e.time}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {e.location}</span>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">{e.vibe}</Badge>
                  <Badge variant="outline">{e.attire}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground"><Users className="w-3.5 h-3.5" /> RSVPs</div>
                  <p className="font-display font-bold text-foreground">{e.rsvps}/{e.capacity}</p>
                </div>
                <Button variant="outline" size="sm">Manage</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {past.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-display font-semibold text-muted-foreground text-lg">Past Events</h2>
          {past.map((e) => (
            <Card key={e.id} className="p-5 bg-muted/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-muted-foreground">{e.name}</h3>
                  <p className="text-sm text-muted-foreground">{e.date} · {e.rsvps} attended</p>
                </div>
                <Button variant="ghost" size="sm">View Log</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
