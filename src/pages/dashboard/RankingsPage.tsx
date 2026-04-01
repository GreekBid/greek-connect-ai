import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Minus, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface RankedRushee {
  user_id: string;
  full_name: string;
  major: string | null;
  yes: number;
  maybe: number;
  no: number;
  myVote: string | null;
  score: number;
}

export default function RankingsPage() {
  const { user } = useAuth();
  const [rushees, setRushees] = useState<RankedRushee[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;
    const [{ data: profiles }, { data: votes }] = await Promise.all([
      supabase.from("profiles").select("user_id, full_name, major").eq("role", "rushee"),
      supabase.from("rankings").select("*"),
    ]);

    const voteMap: Record<string, { yes: number; maybe: number; no: number; myVote: string | null }> = {};
    (votes as any[] || []).forEach((v: any) => {
      if (!voteMap[v.rushee_id]) voteMap[v.rushee_id] = { yes: 0, maybe: 0, no: 0, myVote: null };
      voteMap[v.rushee_id][v.vote as "yes" | "maybe" | "no"]++;
      if (v.voter_id === user.id) voteMap[v.rushee_id].myVote = v.vote;
    });

    const ranked: RankedRushee[] = (profiles || []).map((p) => {
      const v = voteMap[p.user_id] || { yes: 0, maybe: 0, no: 0, myVote: null };
      return { user_id: p.user_id, full_name: p.full_name, major: p.major, ...v, score: v.yes * 3 + v.maybe * 1 - v.no * 2 };
    });
    ranked.sort((a, b) => b.score - a.score);
    setRushees(ranked);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const castVote = async (rusheeId: string, vote: string) => {
    if (!user) return;
    const rushee = rushees.find((r) => r.user_id === rusheeId);
    if (rushee?.myVote === vote) {
      // Remove vote
      await supabase.from("rankings").delete().eq("rushee_id", rusheeId).eq("voter_id", user.id);
    } else if (rushee?.myVote) {
      // Update vote
      await supabase.from("rankings").update({ vote } as any).eq("rushee_id", rusheeId).eq("voter_id", user.id);
    } else {
      // Insert vote
      await supabase.from("rankings").insert({ rushee_id: rusheeId, voter_id: user.id, vote } as any);
    }
    fetchData();
  };

  const getStatus = (r: RankedRushee) => {
    if (r.yes >= 5) return "Strong Yes";
    if (r.yes > r.no) return "Yes";
    if (r.no > r.yes) return "No";
    return "Maybe";
  };

  const statusColor: Record<string, string> = {
    "Strong Yes": "bg-secondary text-secondary-foreground",
    Yes: "bg-accent text-accent-foreground",
    Maybe: "bg-muted text-muted-foreground",
    No: "bg-destructive/10 text-destructive",
  };

  if (loading) return <div className="text-muted-foreground p-8">Loading rankings…</div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-display font-bold text-foreground">Private Rankings</h1>
            <Lock className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mt-1">Only visible to chapter members · {rushees.length} rushees</p>
        </div>
      </div>

      {rushees.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground bg-card shadow-warm">
          <p>No rushees have signed up yet — rankings will appear here once they do.</p>
        </Card>
      ) : (
        <Card className="bg-card shadow-warm overflow-hidden">
          <div className="divide-y divide-border">
            {rushees.map((r, i) => {
              const status = getStatus(r);
              return (
                <div key={r.user_id} className="p-4 flex items-center gap-4 hover:bg-accent/30 transition-colors">
                  <span className="w-8 h-8 rounded-full bg-accent flex items-center justify-center font-display font-bold text-accent-foreground text-sm shrink-0">
                    #{i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{r.full_name}</h3>
                      <Badge className={statusColor[status] || ""}>{status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{r.major || "Undeclared"} · Score: {r.score}</p>
                  </div>
                  <div className="flex items-center gap-3 text-sm shrink-0">
                    <span className="flex items-center gap-1 text-secondary-foreground"><ThumbsUp className="w-3.5 h-3.5" /> {r.yes}</span>
                    <span className="flex items-center gap-1 text-muted-foreground"><Minus className="w-3.5 h-3.5" /> {r.maybe}</span>
                    <span className="flex items-center gap-1 text-destructive"><ThumbsDown className="w-3.5 h-3.5" /> {r.no}</span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant={r.myVote === "yes" ? "default" : "ghost"} size="sm" className="h-8 w-8 p-0" onClick={() => castVote(r.user_id, "yes")}>
                      <ThumbsUp className="w-4 h-4" />
                    </Button>
                    <Button variant={r.myVote === "maybe" ? "default" : "ghost"} size="sm" className="h-8 w-8 p-0" onClick={() => castVote(r.user_id, "maybe")}>
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Button variant={r.myVote === "no" ? "default" : "ghost"} size="sm" className="h-8 w-8 p-0" onClick={() => castVote(r.user_id, "no")}>
                      <ThumbsDown className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
