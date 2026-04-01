import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, MapPin, User, CheckCircle, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

interface EventWithRsvp {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  vibe: string;
  attire: string;
  status: string;
  rsvpCount: number;
  rsvpd: boolean;
}

export default function RusheeEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventWithRsvp[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("upcoming");

  const fetchEvents = async () => {
    if (!user) return;
    const { data: eventsData, error: eventsErr } = await supabase.from("events").select("*").order("date", { ascending: true });
    if (eventsErr) { console.error(eventsErr); return; }

    const { data: rsvpsData } = await supabase.from("event_rsvps").select("event_id, user_id");
    const rsvpsByEvent: Record<string, string[]> = {};
    (rsvpsData || []).forEach((r) => {
      if (!rsvpsByEvent[r.event_id]) rsvpsByEvent[r.event_id] = [];
      rsvpsByEvent[r.event_id].push(r.user_id);
    });

    const mapped: EventWithRsvp[] = (eventsData || []).map((e) => ({
      id: e.id,
      name: e.name,
      description: e.description || "",
      date: e.date,
      time: e.time,
      location: e.location,
      capacity: e.capacity || 50,
      vibe: e.vibe || "Casual",
      attire: e.attire || "Casual",
      status: e.status,
      rsvpCount: (rsvpsByEvent[e.id] || []).length,
      rsvpd: (rsvpsByEvent[e.id] || []).includes(user.id),
    }));
    setEvents(mapped);
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, [user]);

  const toggleRsvp = async (id: string) => {
    if (!user) return;
    const event = events.find((e) => e.id === id);
    if (!event) return;

    if (event.rsvpd) {
      const { error } = await supabase.from("event_rsvps").delete().eq("event_id", id).eq("user_id", user.id);
      if (error) { toast.error("Failed to cancel RSVP"); return; }
      toast.success(`Cancelled RSVP for ${event.name}`);
    } else {
      const { error } = await supabase.from("event_rsvps").insert({ event_id: id, user_id: user.id });
      if (error) { toast.error("Failed to RSVP"); return; }
      toast.success(`RSVP'd to ${event.name}!`);
    }
    fetchEvents();
  };

  const today = new Date().toISOString().split("T")[0];
  const upcoming = events.filter((e) => e.date >= today);
  const past = events.filter((e) => e.date < today);
  const myRsvps = events.filter((e) => e.rsvpd);

  const displayed = tab === "upcoming" ? upcoming : tab === "past" ? past : myRsvps;
  const filtered = displayed.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="text-muted-foreground p-8">Loading events…</div>;

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
              <p>{tab === "upcoming" ? "No upcoming events yet — check back soon!" : "No events found"}</p>
            </div>
          )}
          {filtered.map((e) => {
            const spotsLeft = e.capacity - e.rsvpCount;
            const dateObj = new Date(e.date + "T00:00:00");
            const monthStr = format(dateObj, "MMM");
            const dayStr = format(dateObj, "d");
            return (
              <Card key={e.id} className={`p-5 bg-card shadow-warm hover:shadow-warm-lg transition-shadow ${tab === "past" ? "opacity-70" : ""}`}>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex md:flex-col items-center md:items-center gap-2 md:gap-0 md:w-16 shrink-0 md:pt-1">
                    <span className="text-xs text-muted-foreground font-medium uppercase">{monthStr}</span>
                    <span className="text-2xl font-display font-bold text-foreground">{dayStr}</span>
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="font-display font-semibold text-foreground text-lg">{e.name}</h3>
                    {e.description && <p className="text-sm text-muted-foreground">{e.description}</p>}
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{e.time}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{e.location}</span>
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{e.attire}</span>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Badge variant="secondary">{e.vibe}</Badge>
                      <Badge variant="outline">{e.rsvpCount}/{e.capacity} spots</Badge>
                      {spotsLeft <= 5 && spotsLeft > 0 && <Badge variant="outline" className="text-destructive border-destructive/30">Only {spotsLeft} left</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center shrink-0">
                    {tab !== "past" ? (
                      <Button variant={e.rsvpd ? "default" : "outline"} size="sm" className="gap-2 min-w-[100px]" onClick={() => toggleRsvp(e.id)}>
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
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
