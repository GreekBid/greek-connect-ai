import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle, Clock, ArrowRight, Plus, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Bid {
  id: string;
  rushee_id: string;
  chapter_user_id: string;
  status: string;
  notes: string;
  created_at: string;
  rushee_name?: string;
  rushee_major?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  under_review: { label: "Under Review", color: "bg-accent", icon: Clock },
  bid_extended: { label: "Bid Extended", color: "bg-secondary", icon: ArrowRight },
  accepted: { label: "Accepted", color: "bg-primary/10", icon: CheckCircle2 },
  declined: { label: "Declined", color: "bg-muted", icon: XCircle },
};

export default function BidsPage() {
  const { user } = useAuth();
  const [bids, setBids] = useState<Bid[]>([]);
  const [rushees, setRushees] = useState<{ user_id: string; full_name: string; major: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newRusheeId, setNewRusheeId] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const fetchData = async () => {
    if (!user) return;
    const [{ data: bidsData }, { data: profilesData }] = await Promise.all([
      supabase.from("bids").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("user_id, full_name, major").eq("role", "rushee"),
    ]);

    const profileMap = new Map((profilesData || []).map((p) => [p.user_id, p]));
    const mapped: Bid[] = (bidsData || []).map((b: any) => ({
      ...b,
      rushee_name: profileMap.get(b.rushee_id)?.full_name || "Unknown",
      rushee_major: profileMap.get(b.rushee_id)?.major || "",
    }));

    setBids(mapped);
    setRushees(profilesData || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const addBid = async () => {
    if (!user || !newRusheeId) return;
    const { error } = await supabase.from("bids").insert({
      rushee_id: newRusheeId,
      chapter_user_id: user.id,
      notes: newNotes,
    } as any);
    if (error) { toast.error("Failed to add bid"); return; }
    toast.success("Rushee added to pipeline!");
    setDialogOpen(false);
    setNewRusheeId("");
    setNewNotes("");
    fetchData();
  };

  const updateStatus = async (bidId: string, newStatus: string) => {
    const { error } = await supabase.from("bids").update({ status: newStatus, updated_at: new Date().toISOString() } as any).eq("id", bidId);
    if (error) { toast.error("Failed to update"); return; }
    toast.success("Status updated");
    fetchData();
  };

  const filtered = bids.filter((b) => (b.rushee_name || "").toLowerCase().includes(search.toLowerCase()));
  const grouped = Object.keys(STATUS_CONFIG).map((status) => ({
    status,
    ...STATUS_CONFIG[status],
    items: filtered.filter((b) => b.status === status),
  }));

  if (loading) return <div className="text-muted-foreground p-8">Loading bids…</div>;

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Bid Management</h1>
          <p className="text-muted-foreground mt-1">Track applicants through the bid pipeline</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search…" className="pl-9 w-48" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="w-4 h-4" /> Add to Pipeline</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Rushee to Pipeline</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <Select value={newRusheeId} onValueChange={setNewRusheeId}>
                  <SelectTrigger><SelectValue placeholder="Select a rushee" /></SelectTrigger>
                  <SelectContent>
                    {rushees.filter((r) => !bids.some((b) => b.rushee_id === r.user_id)).map((r) => (
                      <SelectItem key={r.user_id} value={r.user_id}>{r.full_name} — {r.major || "Undeclared"}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea placeholder="Initial notes…" value={newNotes} onChange={(e) => setNewNotes(e.target.value)} />
                <Button className="w-full" onClick={addBid} disabled={!newRusheeId}>Add to Pipeline</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {grouped.map((col) => {
          const Icon = col.icon;
          return (
            <Card key={col.status} className="bg-card shadow-warm">
              <div className={`p-3 ${col.color} rounded-t-lg flex items-center gap-2`}>
                <Icon className="w-4 h-4" />
                <h3 className="font-display font-semibold text-sm">{col.label}</h3>
                <Badge variant="outline" className="ml-auto text-xs">{col.items.length}</Badge>
              </div>
              <div className="p-3 space-y-2 min-h-[120px]">
                {col.items.length === 0 && <p className="text-xs text-muted-foreground text-center py-6">No rushees here</p>}
                {col.items.map((b) => (
                  <div key={b.id} className="p-3 rounded-lg bg-background border border-border hover:border-primary/30 transition-colors">
                    <p className="font-semibold text-foreground text-sm">{b.rushee_name}</p>
                    <p className="text-xs text-muted-foreground">{b.rushee_major}</p>
                    {b.notes && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{b.notes}</p>}
                    <Select value={b.status} onValueChange={(v) => updateStatus(b.id, v)}>
                      <SelectTrigger className="mt-2 h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
