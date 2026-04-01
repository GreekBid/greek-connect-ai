import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, MapPin, Clock, Users, Plus, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

interface RsvpUser {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
}

interface EventRow {
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
  rsvpUsers: RsvpUser[];
}

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", date: "", time: "", location: "", capacity: "50", vibe: "Casual", attire: "Casual" });

  const fetchEvents = async () => {
    const { data: eventsData } = await supabase.from("events").select("*").order("date", { ascending: true });
    const { data: rsvpsData } = await supabase.from("event_rsvps").select("event_id");
    const counts: Record<string, number> = {};
    (rsvpsData || []).forEach((r) => { counts[r.event_id] = (counts[r.event_id] || 0) + 1; });
    setEvents((eventsData || []).map((e) => ({ ...e, description: e.description || "", capacity: e.capacity || 50, vibe: e.vibe || "Casual", attire: e.attire || "Casual", rsvpCount: counts[e.id] || 0 })));
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, []);

  const createEvent = async () => {
    if (!user || !form.name || !form.date || !form.time) { toast.error("Fill in name, date, and time"); return; }
    setCreating(true);
    const { error } = await supabase.from("events").insert({
      created_by: user.id,
      name: form.name,
      description: form.description,
      date: form.date,
      time: form.time,
      location: form.location,
      capacity: parseInt(form.capacity) || 50,
      vibe: form.vibe,
      attire: form.attire,
    });
    setCreating(false);
    if (error) { toast.error("Failed to create event"); return; }
    toast.success("Event created!");
    setDialogOpen(false);
    setForm({ name: "", description: "", date: "", time: "", location: "", capacity: "50", vibe: "Casual", attire: "Casual" });
    fetchEvents();
  };

  const today = new Date().toISOString().split("T")[0];
  const upcoming = events.filter((e) => e.date >= today);
  const past = events.filter((e) => e.date < today);

  if (loading) return <div className="text-muted-foreground p-8">Loading events…</div>;

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Events</h1>
          <p className="text-muted-foreground mt-1">{upcoming.length} upcoming events</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" size="sm" className="gap-2"><Plus className="w-4 h-4" /> Create Event</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Rush Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              <Input placeholder="Event name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
              </div>
              <Input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              <div className="grid grid-cols-3 gap-3">
                <Input placeholder="Capacity" type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
                <Input placeholder="Vibe (e.g. Casual)" value={form.vibe} onChange={(e) => setForm({ ...form, vibe: e.target.value })} />
                <Input placeholder="Attire" value={form.attire} onChange={(e) => setForm({ ...form, attire: e.target.value })} />
              </div>
              <Button onClick={createEvent} disabled={creating} className="w-full gap-2">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Create Event
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {upcoming.length > 0 && <h2 className="font-display font-semibold text-foreground text-lg">Upcoming</h2>}
        {upcoming.map((e) => {
          const dateObj = new Date(e.date + "T00:00:00");
          return (
            <Card key={e.id} className="p-5 bg-card shadow-warm hover:shadow-warm-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <h3 className="font-display font-semibold text-foreground text-lg">{e.name}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {format(dateObj, "MMM d, yyyy")}</span>
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
                    <p className="font-display font-bold text-foreground">{e.rsvpCount}/{e.capacity}</p>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {past.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-display font-semibold text-muted-foreground text-lg">Past Events</h2>
          {past.map((e) => (
            <Card key={e.id} className="p-5 bg-muted/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-muted-foreground">{e.name}</h3>
                  <p className="text-sm text-muted-foreground">{e.date} · {e.rsvpCount} attended</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {events.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No events yet — create your first rush event!</p>
        </div>
      )}
    </div>
  );
}
