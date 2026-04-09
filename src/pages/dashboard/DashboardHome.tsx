import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Users, Calendar, ArrowRight, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

export default function DashboardHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({ rushees: 0, events: 0, rsvps: 0, messages: 0 });
  const [upcomingEvents, setUpcomingEvents] = useState<{ name: string; date: string }[]>([]);
  const [recentMessages, setRecentMessages] = useState<{ content: string; created_at: string }[]>([]);
  const [profileInfo, setProfileInfo] = useState<{ full_name: string; chapterRole: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      const today = new Date().toISOString().split("T")[0];
      const [{ count: r }, { count: e }, { count: rv }, { count: m }, { data: upcoming }, { data: msgs }] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "rushee"),
        supabase.from("events").select("*", { count: "exact", head: true }),
        supabase.from("event_rsvps").select("*", { count: "exact", head: true }),
        supabase.from("messages").select("*", { count: "exact", head: true }),
        supabase.from("events").select("name, date").gte("date", today).order("date").limit(3),
        supabase.from("messages").select("content, created_at").order("created_at", { ascending: false }).limit(4),
      ]);
      setStats({ rushees: r || 0, events: e || 0, rsvps: rv || 0, messages: m || 0 });
      setUpcomingEvents(upcoming || []);
      setRecentMessages(msgs || []);
    };
    load();
  }, []);

  useEffect(() => {
    if (!user) return;
    const loadProfile = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, chapter_id")
        .eq("user_id", user.id)
        .single();

      if (!profile) return;

      let chapterRole = "Chapter";
      if (profile.chapter_id) {
        const { data: membership } = await supabase
          .from("chapter_members")
          .select("role")
          .eq("user_id", user.id)
          .eq("chapter_id", profile.chapter_id)
          .single();
        if (membership?.role === "admin") {
          chapterRole = "Admin";
        } else if (membership?.role === "member") {
          chapterRole = "Chapter Member";
        }
      }
      setProfileInfo({ full_name: profile.full_name, chapterRole });
    };
    loadProfile();
  }, [user]);

  const statCards = [
    { label: "Rushees", value: stats.rushees, icon: Users },
    { label: "Events", value: stats.events, icon: Calendar },
    { label: "RSVPs", value: stats.rsvps, icon: ArrowRight },
    { label: "Messages", value: stats.messages, icon: MessageSquare },
  ];

  const quickActions = [
    { label: "Create Event", path: "/dashboard/events" },
    { label: "View Rankings", path: "/dashboard/rankings" },
    { label: "Send Message", path: "/dashboard/messages" },
    { label: "Manage Bids", path: "/dashboard/bids" },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Welcome back 👋</h1>
        {profileInfo && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-muted-foreground">{profileInfo.full_name}</span>
            <Badge variant="secondary" className="text-xs">{profileInfo.chapterRole}</Badge>
          </div>
        )}
        <p className="text-muted-foreground mt-1">Here's what's happening with your rush.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.label} className="p-5 bg-card shadow-warm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-display font-bold text-foreground mt-1">{s.value}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <s.icon className="w-5 h-5 text-primary" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-card shadow-warm">
          <h2 className="font-display font-semibold text-foreground text-lg mb-4">Upcoming Events</h2>
          {upcomingEvents.length === 0 ? (
            <p className="text-muted-foreground text-sm">No upcoming events — create one!</p>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((e, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  <span className="text-foreground flex-1">{e.name}</span>
                  <span className="text-muted-foreground text-xs">{format(new Date(e.date + "T00:00:00"), "MMM d")}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6 bg-card shadow-warm">
          <h2 className="font-display font-semibold text-foreground text-lg mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((a) => (
              <button key={a.label} onClick={() => navigate(a.path)} className="p-4 rounded-lg bg-accent hover:bg-accent/80 transition-colors text-sm font-medium text-accent-foreground text-left">
                {a.label}
              </button>
            ))}
          </div>
        </Card>

        {recentMessages.length > 0 && (
          <Card className="p-6 bg-card shadow-warm lg:col-span-2">
            <h2 className="font-display font-semibold text-foreground text-lg mb-4">Recent Messages</h2>
            <div className="space-y-3">
              {recentMessages.map((m, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-foreground line-clamp-1">{m.content}</p>
                    <p className="text-muted-foreground text-xs">{format(new Date(m.created_at), "MMM d, h:mm a")}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
