import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { supabase } from "@/integrations/supabase/client";

const COLORS = ["hsl(145, 25%, 40%)", "hsl(0, 65%, 55%)", "hsl(40, 70%, 60%)", "hsl(200, 50%, 50%)"];

export default function AnalyticsPage() {
  const [stats, setStats] = useState({ rushees: 0, events: 0, rsvps: 0, messages: 0 });
  const [eventData, setEventData] = useState<{ name: string; attendance: number }[]>([]);
  const [bidData, setBidData] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    const load = async () => {
      const [{ count: rusheeCount }, { count: eventCount }, { count: rsvpCount }, { count: msgCount }] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "rushee"),
        supabase.from("events").select("*", { count: "exact", head: true }),
        supabase.from("event_rsvps").select("*", { count: "exact", head: true }),
        supabase.from("messages").select("*", { count: "exact", head: true }),
      ]);
      setStats({ rushees: rusheeCount || 0, events: eventCount || 0, rsvps: rsvpCount || 0, messages: msgCount || 0 });

      // Event attendance
      const { data: events } = await supabase.from("events").select("id, name");
      const { data: rsvps } = await supabase.from("event_rsvps").select("event_id");
      if (events && rsvps) {
        const countMap: Record<string, number> = {};
        rsvps.forEach((r) => { countMap[r.event_id] = (countMap[r.event_id] || 0) + 1; });
        setEventData(events.slice(0, 6).map((e) => ({ name: e.name.length > 12 ? e.name.slice(0, 12) + "…" : e.name, attendance: countMap[e.id] || 0 })));
      }

      // Bid breakdown
      const { data: bids } = await supabase.from("bids").select("status");
      if (bids) {
        const statusCount: Record<string, number> = {};
        (bids as any[]).forEach((b) => { statusCount[b.status] = (statusCount[b.status] || 0) + 1; });
        setBidData(Object.entries(statusCount).map(([name, value]) => ({ name: name.replace("_", " "), value })));
      }
    };
    load();
  }, []);

  const conversionRate = stats.rushees > 0 ? ((stats.rsvps / Math.max(stats.rushees, 1)) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-1">Track your rush pipeline and event performance</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Rushees", value: stats.rushees },
          { label: "Events Created", value: stats.events },
          { label: "Total RSVPs", value: stats.rsvps },
          { label: "Messages Sent", value: stats.messages },
        ].map((m) => (
          <Card key={m.label} className="p-5 bg-card shadow-warm">
            <p className="text-xs text-muted-foreground">{m.label}</p>
            <p className="text-2xl font-display font-bold text-foreground">{m.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-card shadow-warm">
          <h2 className="font-display font-semibold text-foreground mb-4">Event Attendance</h2>
          {eventData.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">Create events and get RSVPs to see data here</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={eventData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="attendance" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-6 bg-card shadow-warm">
          <h2 className="font-display font-semibold text-foreground mb-4">Bid Pipeline</h2>
          {bidData.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">Add rushees to the bid pipeline to see breakdown</p>
          ) : (
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={bidData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {bidData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card className="p-6 bg-card shadow-warm lg:col-span-2">
          <h2 className="font-display font-semibold text-foreground mb-4">Key Metrics</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "RSVP Rate", value: `${conversionRate}%`, sub: "RSVPs per rushee" },
              { label: "Avg RSVPs/Event", value: stats.events > 0 ? (stats.rsvps / stats.events).toFixed(1) : "0", sub: "Across all events" },
              { label: "Bid Pipeline", value: bidData.reduce((s, d) => s + d.value, 0).toString(), sub: "Total in pipeline" },
              { label: "Chapter Messages", value: stats.messages.toString(), sub: "Broadcasts sent" },
            ].map((m) => (
              <div key={m.label} className="p-4 rounded-lg bg-accent">
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className="text-xl font-display font-bold text-foreground">{m.value}</p>
                <p className="text-xs text-muted-foreground">{m.sub}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
