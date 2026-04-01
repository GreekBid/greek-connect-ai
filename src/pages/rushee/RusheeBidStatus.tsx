import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, ArrowRight, XCircle, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

interface BidView {
  id: string;
  status: string;
  notes: string;
  updated_at: string;
}

const statusConfig: Record<string, { label: string; icon: typeof Clock; badgeClass: string; description: string }> = {
  under_review: { label: "Under Review", icon: Clock, badgeClass: "bg-accent text-accent-foreground", description: "Your application is being reviewed by the chapter." },
  bid_extended: { label: "Bid Extended!", icon: ArrowRight, badgeClass: "bg-primary/10 text-primary", description: "Congratulations! The chapter has extended you a bid." },
  accepted: { label: "Accepted", icon: CheckCircle2, badgeClass: "bg-secondary text-secondary-foreground", description: "You've accepted the bid — welcome to the chapter!" },
  declined: { label: "Declined", icon: XCircle, badgeClass: "bg-muted text-muted-foreground", description: "This bid was declined." },
};

export default function RusheeBidStatus() {
  const { user } = useAuth();
  const [bids, setBids] = useState<BidView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("bids")
        .select("id, status, notes, updated_at")
        .eq("rushee_id", user.id)
        .order("updated_at", { ascending: false });
      setBids((data as any[]) || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  if (loading) return <div className="text-muted-foreground p-8">Loading…</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">My Bid Status</h1>
        <p className="text-muted-foreground mt-1">Track where you stand in the recruitment process.</p>
      </div>

      {bids.length === 0 ? (
        <Card className="p-12 text-center bg-card shadow-warm">
          <FileText className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-40" />
          <p className="text-muted-foreground">No bids yet — chapters will add you to their pipeline as rush progresses.</p>
          <p className="text-xs text-muted-foreground mt-2">Keep attending events and making connections!</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {bids.map((bid) => {
            const cfg = statusConfig[bid.status] || statusConfig.under_review;
            const Icon = cfg.icon;
            return (
              <Card key={bid.id} className="p-6 bg-card shadow-warm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <Badge className={cfg.badgeClass}>{cfg.label}</Badge>
                      <span className="text-xs text-muted-foreground">
                        Updated {formatDistanceToNow(new Date(bid.updated_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground mt-2">{cfg.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
