import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, X, Trash2, UserCheck, Clock, Shield } from "lucide-react";

interface Member {
  id: string;
  user_id: string;
  role: string;
  status: string;
  created_at: string;
  profile?: {
    full_name: string;
    email?: string;
    avatar_url?: string;
    college?: string;
  };
  activity?: {
    votes: number;
    stars: number;
    notes: number;
  };
}

export default function MembersPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [chapterId, setChapterId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchChapterAndMembers();
  }, [user]);

  const fetchChapterAndMembers = async () => {
    if (!user) return;
    setLoading(true);

    // Get current user's chapter (from profile, works for all chapter accounts)
    const { data: profile } = await supabase
      .from("profiles")
      .select("chapter_id")
      .eq("user_id", user.id)
      .single();

    const membership = profile?.chapter_id ? { chapter_id: profile.chapter_id } : null;

    if (!membership) {
      setLoading(false);
      return;
    }

    setChapterId(membership.chapter_id);

    // Get all members of this chapter
    const { data: membersData } = await supabase
      .from("chapter_members")
      .select("*")
      .eq("chapter_id", membership.chapter_id)
      .order("created_at", { ascending: false });

    if (!membersData) {
      setLoading(false);
      return;
    }

    // Fetch profiles for all members
    const userIds = membersData.map((m) => m.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, avatar_url, college")
      .in("user_id", userIds);

    // Fetch activity counts for each member
    const enrichedMembers = await Promise.all(
      membersData.map(async (m) => {
        const profile = profiles?.find((p) => p.user_id === m.user_id);

        // Count votes/rankings
        const { count: votes } = await supabase
          .from("rankings")
          .select("id", { count: "exact", head: true })
          .eq("voter_id", m.user_id);

        // Count stars
        const { count: stars } = await supabase
          .from("stars")
          .select("id", { count: "exact", head: true })
          .eq("starred_by", m.user_id);

        // Count notes
        const { count: notes } = await supabase
          .from("rush_notes")
          .select("id", { count: "exact", head: true })
          .eq("author_id", m.user_id);

        return {
          ...m,
          profile: profile
            ? { full_name: profile.full_name, avatar_url: profile.avatar_url, college: profile.college ?? undefined }
            : { full_name: "Unknown" },
          activity: { votes: votes ?? 0, stars: stars ?? 0, notes: notes ?? 0 },
        };
      })
    );

    setMembers(enrichedMembers);
    setLoading(false);
  };

  const updateStatus = async (memberId: string, status: "approved" | "rejected") => {
    const { error } = await supabase
      .from("chapter_members")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", memberId);

    if (error) {
      toast.error("Failed to update member");
      return;
    }
    toast.success(status === "approved" ? "Member approved!" : "Member rejected");

    // Send acceptance email
    if (status === "approved" && chapterId) {
      const member = members.find((m) => m.id === memberId);
      if (member) {
        const { data: memberProfile } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("user_id", member.user_id)
          .single();

        const { data: chapter } = await supabase
          .from("chapters")
          .select("name")
          .eq("id", chapterId)
          .single();

        if (memberProfile?.email) {
          supabase.functions.invoke("send-transactional-email", {
            body: {
              templateName: "member-approved",
              recipientEmail: memberProfile.email,
              templateData: {
                memberName: memberProfile.full_name || "there",
                chapterName: chapter?.name || "the chapter",
              },
            },
          });
        }
      }
    }

    fetchChapterAndMembers();
  };

  const removeMember = async (memberId: string) => {
    const { error } = await supabase
      .from("chapter_members")
      .delete()
      .eq("id", memberId);

    if (error) {
      toast.error("Failed to remove member");
      return;
    }
    toast.success("Member removed");
    fetchChapterAndMembers();
  };

  const pending = members.filter((m) => m.status === "pending");
  const approved = members.filter((m) => m.status === "approved");
  const rejected = members.filter((m) => m.status === "rejected");

  if (loading) {
    return <div className="text-muted-foreground">Loading members…</div>;
  }

  if (!chapterId) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>You are not an admin of any chapter.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Manage Members</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Approve or reject join requests and manage your chapter's members.
        </p>
      </div>

      {/* Pending Requests */}
      {pending.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            Pending Requests ({pending.length})
          </h2>
          <div className="grid gap-3">
            {pending.map((m) => (
              <Card key={m.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center font-display font-bold text-sm text-accent-foreground">
                    {m.profile?.full_name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{m.profile?.full_name}</p>
                    <p className="text-xs text-muted-foreground">Requested {new Date(m.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="default" onClick={() => updateStatus(m.id, "approved")} className="gap-1">
                    <Check className="w-4 h-4" /> Approve
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => updateStatus(m.id, "rejected")} className="gap-1">
                    <X className="w-4 h-4" /> Reject
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Approved Members */}
      <section className="space-y-3">
        <h2 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-green-500" />
          Active Members ({approved.length})
        </h2>
        {approved.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active members yet.</p>
        ) : (
          <div className="grid gap-3">
            {approved.map((m) => (
              <Card key={m.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center font-display font-bold text-sm text-accent-foreground">
                    {m.profile?.full_name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground flex items-center gap-2">
                      {m.profile?.full_name}
                      {m.role === "admin" && (
                        <Badge variant="secondary" className="text-xs gap-1">
                          <Shield className="w-3 h-3" /> Admin
                        </Badge>
                      )}
                    </p>
                    <div className="flex gap-3 text-xs text-muted-foreground mt-0.5">
                      <span>{m.activity?.votes ?? 0} votes</span>
                      <span>{m.activity?.stars ?? 0} stars</span>
                      <span>{m.activity?.notes ?? 0} notes</span>
                    </div>
                  </div>
                </div>
                {m.role !== "admin" && m.user_id !== user?.id && (
                  <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => removeMember(m.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Rejected */}
      {rejected.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-display font-semibold text-foreground text-muted-foreground">
            Rejected ({rejected.length})
          </h2>
          <div className="grid gap-3">
            {rejected.map((m) => (
              <Card key={m.id} className="p-4 flex items-center justify-between opacity-60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-display font-bold text-sm text-muted-foreground">
                    {m.profile?.full_name?.charAt(0) || "?"}
                  </div>
                  <p className="font-semibold text-foreground">{m.profile?.full_name}</p>
                </div>
                <Badge variant="destructive">Rejected</Badge>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
