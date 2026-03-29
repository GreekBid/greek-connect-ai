import { Card } from "@/components/ui/card";
import { Users, Calendar, Star, TrendingUp } from "lucide-react";

const stats = [
  { label: "Active Rushees", value: "47", icon: Users, change: "+12 this week" },
  { label: "Upcoming Events", value: "5", icon: Calendar, change: "Next: BBQ Friday" },
  { label: "Starred Applicants", value: "14", icon: Star, change: "3 new today" },
  { label: "Bid Rate", value: "32%", icon: TrendingUp, change: "↑ 5% vs last year" },
];

const recentActivity = [
  { text: "Jake M. submitted interest form", time: "2 min ago" },
  { text: "BBQ event RSVP count hit 35", time: "15 min ago" },
  { text: "AI Coach matched 4 interview pairs", time: "1 hr ago" },
  { text: "Emily R. was starred by 3 brothers", time: "2 hrs ago" },
  { text: "Game Night event created", time: "3 hrs ago" },
];

export default function DashboardHome() {
  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Welcome back 👋</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening with your rush.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5 bg-card shadow-warm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-display font-bold text-foreground mt-1">{s.value}</p>
                <p className="text-xs text-primary mt-1">{s.change}</p>
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
          <h2 className="font-display font-semibold text-foreground text-lg mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-foreground">{a.text}</p>
                  <p className="text-muted-foreground text-xs">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-card shadow-warm">
          <h2 className="font-display font-semibold text-foreground text-lg mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {["Create Event", "View Rankings", "Send Message", "AI Interview Prep"].map((action) => (
              <button key={action} className="p-4 rounded-lg bg-accent hover:bg-accent/80 transition-colors text-sm font-medium text-accent-foreground text-left">
                {action}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
