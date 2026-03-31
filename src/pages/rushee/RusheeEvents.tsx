import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, User, CheckCircle, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface RushEvent {
  id: string;
  name: string;
  org: string;
  date: string;
  time: string;
  location: string;
  vibe: string;
  attire: string;
  description: string;
  spotsLeft: number;
  rsvpd: boolean;
}

const mockEvents: RushEvent[] = [
  { id: "1", name: "Welcome BBQ", org: "Alpha Beta Gamma", date: "Apr 4, 2026", time: "5:00 PM", location: "Chapter House Backyard", vibe: "Casual", attire: "Shorts & tees", description: "Come out for burgers, games, and good vibes. A chill way to meet the brothers and see if we're a good fit.", spotsLeft: 15, rsvpd: true },
  { id: "2", name: "Game Night", org: "Delta Epsilon", date: "Apr 5, 2026", time: "7:00 PM", location: "Student Union Rm 204", vibe: "Relaxed", attire: "Come as you are", description: "Mario Kart tournament, board games, and snacks. No pressure — just fun.", spotsLeft: 8, rsvpd: false },
  { id: "3", name: "Formal Dinner", org: "Alpha Beta Gamma", date: "Apr 7, 2026", time: "6:30 PM", location: "The Grand Hall", vibe: "Professional", attire: "Business casual", description: "A more formal event to get to know the chapter leadership. Great food, great conversation.", spotsLeft: 12, rsvpd: false },
  { id: "4", name: "Community Service Day", org: "Kappa Sigma", date: "Apr 8, 2026", time: "9:00 AM", location: "City Park", vibe: "Active", attire: "Comfortable clothes", description: "Give back to the community while meeting the brothers. We'll be doing park cleanup and planting trees.", spotsLeft: 7, rsvpd: false },
  { id: "5", name: "Study & Chill", org: "Phi Delta Theta", date: "Apr 9, 2026", time: "3:00 PM", location: "Library Lounge", vibe: "Chill", attire: "Anything", description: "Casual study session with snacks. Good chance to see how brothers balance academics and social life.", spotsLeft: 20, rsvpd: false },
  { id: "6", name: "Info Session", org: "Alpha Beta Gamma", date: "Mar 28, 2026", time: "4:00 PM", location: "Chapter House", vibe: "Informative", attire: "Casual", description: "Learn about our history, values, and what membership looks like.", spotsLeft: 0, rsvpd: true },
];

export default function RusheeEvents() {
  const [events, setEvents] = useState(mockEvents);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("upcoming");

  const now = new Date("2026-04-01");
  const upcoming = events.filter((e) => new Date(e.date) >= now);
  const past = events.filter((e) => new Date(e.date) < now);
  const myRsvps = events.filter((e) => e.rsvpd);

  const displayed = tab === "upcoming" ? upcoming : tab === "past" ? past : myRsvps;
  const filtered = displayed.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.org.toLowerCase().includes(search.toLowerCase())
  );

  const toggleRsvp = (id: string) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        const newRsvp = !e.rsvpd;
        toast.success(newRsvp ? `RSVP'd to ${e.name}!` : `Cancelled RSVP for ${e.name}`);
        return { ...e, rsvpd: newRsvp, spotsLeft: newRsvp ? e.spotsLeft - 1 : e.spotsLeft + 1 };
      })
    );
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Events</h1>
        <p className="text-muted-foreground mt-1">Browse rush events and RSVP to the ones that interest you.</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="my-rsvps">My RSVPs ({myRsvps.length})</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search events…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <TabsContent value={tab} className="mt-4 space-y-4">
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>No events found</p>
            </div>
          )}
          {filtered.map((e) => (
            <Card key={e.id} className={`p-5 bg-card shadow-warm hover:shadow-warm-lg transition-shadow ${tab === "past" ? "opacity-70" : ""}`}>
              <div className="flex flex-col md:flex-row gap-4">
                {/* Date badge */}
                <div className="flex md:flex-col items-center md:items-center gap-2 md:gap-0 md:w-16 shrink-0 md:pt-1">
                  <span className="text-xs text-muted-foreground font-medium uppercase">{e.date.split(" ")[0]}</span>
                  <span className="text-2xl font-display font-bold text-foreground">{e.date.split(" ")[1].replace(",", "")}</span>
                </div>

                {/* Details */}
                <div className="flex-1 space-y-2">
                  <div>
                    <h3 className="font-display font-semibold text-foreground text-lg">{e.name}</h3>
                    <p className="text-sm text-primary font-medium">{e.org}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{e.description}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{e.time}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{e.location}</span>
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />{e.attire}</span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Badge variant="secondary">{e.vibe}</Badge>
                    {e.spotsLeft <= 5 && e.spotsLeft > 0 && <Badge variant="outline" className="text-destructive border-destructive/30">Only {e.spotsLeft} spots left</Badge>}
                  </div>
                </div>

                {/* RSVP */}
                <div className="flex items-center shrink-0">
                  {tab !== "past" ? (
                    <Button
                      variant={e.rsvpd ? "default" : "outline"}
                      size="sm"
                      className="gap-2 min-w-[100px]"
                      onClick={() => toggleRsvp(e.id)}
                    >
                      {e.rsvpd && <CheckCircle className="w-4 h-4" />}
                      {e.rsvpd ? "RSVP'd" : "RSVP"}
                    </Button>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      {e.rsvpd ? <><CheckCircle className="w-3 h-3" /> Attended</> : "Missed"}
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
