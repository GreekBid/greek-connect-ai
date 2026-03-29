import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ThumbsUp, ThumbsDown, Minus, Lock } from "lucide-react";

const mockRankings = [
  { rank: 1, name: "Emily Chen", major: "CS", gpa: "3.9", votes: { yes: 8, maybe: 2, no: 0 }, status: "Strong Yes", notes: "Unanimous favorite" },
  { rank: 2, name: "Tyler Johnson", major: "Engineering", gpa: "3.8", votes: { yes: 7, maybe: 2, no: 1 }, status: "Strong Yes", notes: "Great culture fit" },
  { rank: 3, name: "Jake Martinez", major: "Business", gpa: "3.7", votes: { yes: 6, maybe: 3, no: 1 }, status: "Yes", notes: "Leadership qualities" },
  { rank: 4, name: "Sofia Ramirez", major: "Communications", gpa: "3.6", votes: { yes: 5, maybe: 3, no: 2 }, status: "Yes", notes: "Very social" },
  { rank: 5, name: "Marcus Williams", major: "Pre-Med", gpa: "3.5", votes: { yes: 4, maybe: 4, no: 2 }, status: "Maybe", notes: "Time commitment concern" },
  { rank: 6, name: "Aisha Patel", major: "Psychology", gpa: "3.4", votes: { yes: 3, maybe: 3, no: 4 }, status: "Maybe", notes: "Quiet but thoughtful" },
];

const statusColor: Record<string, string> = {
  "Strong Yes": "bg-secondary text-secondary-foreground",
  "Yes": "bg-accent text-accent-foreground",
  "Maybe": "bg-muted text-muted-foreground",
};

export default function RankingsPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-display font-bold text-foreground">Private Rankings</h1>
            <Lock className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mt-1">Only visible to chapter members</p>
        </div>
        <Button variant="hero" size="sm">Export Rankings</Button>
      </div>

      <Card className="bg-card shadow-warm overflow-hidden">
        <div className="divide-y divide-border">
          {mockRankings.map((r) => (
            <div key={r.rank} className="p-4 flex items-center gap-4 hover:bg-accent/30 transition-colors">
              <span className="w-8 h-8 rounded-full bg-accent flex items-center justify-center font-display font-bold text-accent-foreground text-sm shrink-0">
                #{r.rank}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{r.name}</h3>
                  <Badge className={statusColor[r.status] || ""}>{r.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{r.major} · GPA {r.gpa} · {r.notes}</p>
              </div>
              <div className="flex items-center gap-3 text-sm shrink-0">
                <span className="flex items-center gap-1 text-secondary-foreground"><ThumbsUp className="w-3.5 h-3.5" /> {r.votes.yes}</span>
                <span className="flex items-center gap-1 text-muted-foreground"><Minus className="w-3.5 h-3.5" /> {r.votes.maybe}</span>
                <span className="flex items-center gap-1 text-destructive"><ThumbsDown className="w-3.5 h-3.5" /> {r.votes.no}</span>
              </div>
              <Button variant="ghost" size="sm">Details</Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
