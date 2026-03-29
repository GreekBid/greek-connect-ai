import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Clock, ArrowRight } from "lucide-react";

const bidStages = [
  {
    title: "Under Review",
    color: "bg-accent",
    applicants: [
      { name: "Marcus Williams", major: "Pre-Med", notes: "Needs second interview" },
      { name: "Aisha Patel", major: "Psychology", notes: "Awaiting vote results" },
    ],
  },
  {
    title: "Bid Extended",
    color: "bg-secondary",
    applicants: [
      { name: "Sofia Ramirez", major: "Communications", notes: "Bid sent Apr 2" },
      { name: "Tyler Johnson", major: "Engineering", notes: "Bid sent Apr 1" },
    ],
  },
  {
    title: "Accepted",
    color: "bg-secondary",
    applicants: [
      { name: "Emily Chen", major: "CS", notes: "Accepted Apr 1" },
      { name: "Jake Martinez", major: "Business", notes: "Accepted Mar 30" },
    ],
  },
  {
    title: "Declined",
    color: "bg-muted",
    applicants: [
      { name: "Chris Lee", major: "Finance", notes: "Chose another chapter" },
    ],
  },
];

const icons: Record<string, typeof CheckCircle2> = {
  "Under Review": Clock,
  "Bid Extended": ArrowRight,
  "Accepted": CheckCircle2,
  "Declined": XCircle,
};

export default function BidsPage() {
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Bid Management</h1>
        <p className="text-muted-foreground mt-1">Track applicants through the bid pipeline</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {bidStages.map((stage) => {
          const Icon = icons[stage.title] || Clock;
          return (
            <Card key={stage.title} className="bg-card shadow-warm">
              <div className={`p-3 ${stage.color} rounded-t-lg flex items-center gap-2`}>
                <Icon className="w-4 h-4" />
                <h3 className="font-display font-semibold text-sm">{stage.title}</h3>
                <Badge variant="outline" className="ml-auto text-xs">{stage.applicants.length}</Badge>
              </div>
              <div className="p-3 space-y-2">
                {stage.applicants.map((a) => (
                  <div key={a.name} className="p-3 rounded-lg bg-background border border-border hover:border-primary/30 transition-colors cursor-pointer">
                    <p className="font-semibold text-foreground text-sm">{a.name}</p>
                    <p className="text-xs text-muted-foreground">{a.major}</p>
                    <p className="text-xs text-muted-foreground mt-1">{a.notes}</p>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
