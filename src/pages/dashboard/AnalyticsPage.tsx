import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const funnelData = [
  { stage: "Interest Forms", count: 120 },
  { stage: "Attended Event", count: 85 },
  { stage: "Interviewed", count: 47 },
  { stage: "Starred", count: 14 },
  { stage: "Bids Given", count: 10 },
  { stage: "Accepted", count: 8 },
];

const eventAttendance = [
  { name: "Info Session", attendance: 42 },
  { name: "BBQ", attendance: 35 },
  { name: "Game Night", attendance: 22 },
  { name: "Service Day", attendance: 18 },
  { name: "Formal", attendance: 28 },
];

const bidPie = [
  { name: "Accepted", value: 8 },
  { name: "Declined", value: 2 },
  { name: "Pending", value: 4 },
];

const COLORS = ["hsl(145, 25%, 40%)", "hsl(0, 65%, 55%)", "hsl(40, 70%, 60%)"];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-1">Track your rush pipeline and event performance</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-card shadow-warm">
          <h2 className="font-display font-semibold text-foreground mb-4">Recruitment Funnel</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={funnelData} layout="vertical">
              <XAxis type="number" />
              <YAxis type="category" dataKey="stage" width={110} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(16, 65%, 55%)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 bg-card shadow-warm">
          <h2 className="font-display font-semibold text-foreground mb-4">Event Attendance</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={eventAttendance}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="attendance" fill="hsl(145, 25%, 40%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 bg-card shadow-warm">
          <h2 className="font-display font-semibold text-foreground mb-4">Bid Status</h2>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={bidPie} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {bidPie.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 bg-card shadow-warm">
          <h2 className="font-display font-semibold text-foreground mb-4">Key Metrics</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Conversion Rate", value: "6.7%", sub: "Forms → Accepted" },
              { label: "Avg Events Attended", value: "2.4", sub: "Per rushee" },
              { label: "Interview Rating", value: "4.2/5", sub: "Average AI score" },
              { label: "Top Referral Source", value: "Instagram", sub: "38% of signups" },
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
