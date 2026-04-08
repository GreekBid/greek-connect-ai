import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Users, Building2, GraduationCap, MapPin, Search, Trash2, Eye,
  BarChart3, TrendingUp, School, ChevronDown, ChevronUp, Shield,
} from "lucide-react";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email?: string;
  role: "chapter" | "rushee";
  college: string | null;
  gender: string | null;
  org_type: string | null;
  created_at: string;
  chapter_id: string | null;
}

interface Chapter {
  id: string;
  name: string;
  college: string;
  org_type: string;
  created_by: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCollege, setSelectedCollege] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"overview" | "chapters" | "rushees" | "accounts">("overview");
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  const [chapterMembers, setChapterMembers] = useState<Record<string, any[]>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [profilesRes, chaptersRes] = await Promise.all([
      supabase.from("profiles").select("*"),
      supabase.from("chapters").select("*"),
    ]);
    setProfiles(profilesRes.data ?? []);
    setChapters(chaptersRes.data ?? []);
    setLoading(false);
  };

  const colleges = useMemo(() => {
    const set = new Set<string>();
    profiles.forEach((p) => p.college && set.add(p.college));
    chapters.forEach((c) => c.college && set.add(c.college));
    return Array.from(set).sort();
  }, [profiles, chapters]);

  const rushees = useMemo(() => profiles.filter((p) => p.role === "rushee"), [profiles]);
  const chapterProfiles = useMemo(() => profiles.filter((p) => p.role === "chapter"), [profiles]);

  const filteredRushees = useMemo(() => {
    let list = rushees;
    if (selectedCollege !== "all") list = list.filter((r) => r.college === selectedCollege);
    if (searchQuery) list = list.filter((r) => r.full_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return list;
  }, [rushees, selectedCollege, searchQuery]);

  const filteredChapters = useMemo(() => {
    let list = chapters;
    if (selectedCollege !== "all") list = list.filter((c) => c.college === selectedCollege);
    if (searchQuery) list = list.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return list;
  }, [chapters, selectedCollege, searchQuery]);

  const topColleges = useMemo(() => {
    const counts: Record<string, number> = {};
    profiles.forEach((p) => {
      if (p.college) counts[p.college] = (counts[p.college] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
  }, [profiles]);

  const recentSignups = useMemo(() => {
    return [...profiles].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10);
  }, [profiles]);

  const loadChapterMembers = async (chapterId: string) => {
    if (chapterMembers[chapterId]) {
      setExpandedChapter(expandedChapter === chapterId ? null : chapterId);
      return;
    }
    const { data } = await supabase
      .from("chapter_members")
      .select("*, profiles!chapter_members_user_id_fkey(full_name, college)")
      .eq("chapter_id", chapterId);

    // Fallback: if the join fails, just use chapter_members data
    setChapterMembers((prev) => ({ ...prev, [chapterId]: data ?? [] }));
    setExpandedChapter(chapterId);
  };

  const handleDeleteProfile = async (userId: string, name: string) => {
    if (!confirm(`Delete account for "${name}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("profiles").delete().eq("user_id", userId);
    if (error) {
      toast.error("Failed to delete: " + error.message);
    } else {
      toast.success(`Deleted ${name}`);
      setProfiles((prev) => prev.filter((p) => p.user_id !== userId));
    }
  };

  const handleDeleteChapter = async (id: string, name: string) => {
    if (!confirm(`Delete chapter "${name}"? All members will lose access.`)) return;
    const { error } = await supabase.from("chapters").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete: " + error.message);
    } else {
      toast.success(`Deleted ${name}`);
      setChapters((prev) => prev.filter((c) => c.id !== id));
    }
  };

  if (loading) {
    return <div className="p-8 text-muted-foreground">Loading admin data…</div>;
  }

  const tabs = [
    { key: "overview" as const, label: "Overview", icon: BarChart3 },
    { key: "chapters" as const, label: "Chapters", icon: Building2 },
    { key: "rushees" as const, label: "Rushees", icon: GraduationCap },
    { key: "accounts" as const, label: "All Accounts", icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-7 h-7 text-primary" />
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm">Platform-wide management & analytics</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === t.key
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:bg-accent border border-border"
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      {activeTab !== "overview" && (
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={selectedCollege}
            onChange={(e) => setSelectedCollege(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">All Colleges ({colleges.length})</option>
            {colleges.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 bg-card shadow-warm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold text-foreground">{chapters.length}</p>
                  <p className="text-xs text-muted-foreground">Chapters</p>
                </div>
              </div>
            </Card>
            <Card className="p-5 bg-card shadow-warm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold text-foreground">{rushees.length}</p>
                  <p className="text-xs text-muted-foreground">Rushees</p>
                </div>
              </div>
            </Card>
            <Card className="p-5 bg-card shadow-warm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold text-foreground">{chapterProfiles.length}</p>
                  <p className="text-xs text-muted-foreground">Chapter Members</p>
                </div>
              </div>
            </Card>
            <Card className="p-5 bg-card shadow-warm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <School className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold text-foreground">{colleges.length}</p>
                  <p className="text-xs text-muted-foreground">Colleges</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Gender / Org breakdown */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 bg-card shadow-warm">
              <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Top Colleges by Participants
              </h3>
              {topColleges.length === 0 ? (
                <p className="text-sm text-muted-foreground">No data yet</p>
              ) : (
                <div className="space-y-3">
                  {topColleges.map(([college, count], i) => (
                    <div key={college} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                        <span className="text-sm text-foreground truncate max-w-[200px]">{college}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">{count} users</Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-6 bg-card shadow-warm">
              <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Breakdown
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fraternities</span>
                  <span className="font-medium text-foreground">{chapters.filter(c => c.org_type === "fraternity").length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sororities</span>
                  <span className="font-medium text-foreground">{chapters.filter(c => c.org_type === "sorority").length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Male Rushees</span>
                  <span className="font-medium text-foreground">{rushees.filter(r => r.gender === "male").length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Female Rushees</span>
                  <span className="font-medium text-foreground">{rushees.filter(r => r.gender === "female").length}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Signups */}
          <Card className="p-6 bg-card shadow-warm">
            <h3 className="font-display font-semibold text-foreground mb-4">Recent Signups</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-medium">Name</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Role</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">College</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSignups.map((p) => (
                    <tr key={p.id} className="border-b border-border/50">
                      <td className="py-2 text-foreground">{p.full_name || "—"}</td>
                      <td className="py-2">
                        <Badge variant={p.role === "chapter" ? "default" : "secondary"} className="text-xs">
                          {p.role}
                        </Badge>
                      </td>
                      <td className="py-2 text-muted-foreground text-xs">{p.college || "—"}</td>
                      <td className="py-2 text-muted-foreground text-xs">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Chapters Tab */}
      {activeTab === "chapters" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{filteredChapters.length} chapter(s)</p>
          {filteredChapters.map((ch) => (
            <Card key={ch.id} className="p-5 bg-card shadow-warm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{ch.name}</p>
                    <p className="text-xs text-muted-foreground">{ch.college} · {ch.org_type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => loadChapterMembers(ch.id)}
                    className="gap-1 text-xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Members
                    {expandedChapter === ch.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteChapter(ch.id, ch.name)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              {expandedChapter === ch.id && chapterMembers[ch.id] && (
                <div className="mt-4 border-t border-border pt-3">
                  {chapterMembers[ch.id].length === 0 ? (
                    <p className="text-sm text-muted-foreground">No members</p>
                  ) : (
                    <div className="space-y-2">
                      {chapterMembers[ch.id].map((m: any) => (
                        <div key={m.id} className="flex items-center justify-between text-sm">
                          <span className="text-foreground">{m.profiles?.full_name || m.user_id}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{m.role}</Badge>
                            <Badge variant={m.status === "approved" ? "default" : "secondary"} className="text-xs">
                              {m.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
          {filteredChapters.length === 0 && (
            <p className="text-muted-foreground text-center py-8">No chapters found</p>
          )}
        </div>
      )}

      {/* Rushees Tab */}
      {activeTab === "rushees" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{filteredRushees.length} rushee(s)</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground font-medium">Name</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">College</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Gender</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Joined</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRushees.map((r) => (
                  <tr key={r.id} className="border-b border-border/50">
                    <td className="py-2 text-foreground">{r.full_name || "—"}</td>
                    <td className="py-2 text-muted-foreground text-xs">{r.college || "—"}</td>
                    <td className="py-2">
                      <Badge variant="outline" className="text-xs">{r.gender || "—"}</Badge>
                    </td>
                    <td className="py-2 text-muted-foreground text-xs">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-2 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteProfile(r.user_id, r.full_name)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredRushees.length === 0 && (
            <p className="text-muted-foreground text-center py-8">No rushees found</p>
          )}
        </div>
      )}

      {/* All Accounts Tab */}
      {activeTab === "accounts" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{profiles.length} total account(s)</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground font-medium">Name</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Role</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">College</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Gender</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Org Type</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Joined</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {profiles
                  .filter((p) => {
                    if (selectedCollege !== "all" && p.college !== selectedCollege) return false;
                    if (searchQuery && !p.full_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                    return true;
                  })
                  .map((p) => (
                    <tr key={p.id} className="border-b border-border/50">
                      <td className="py-2 text-foreground">{p.full_name || "—"}</td>
                      <td className="py-2">
                        <Badge variant={p.role === "chapter" ? "default" : "secondary"} className="text-xs">
                          {p.role}
                        </Badge>
                      </td>
                      <td className="py-2 text-muted-foreground text-xs">{p.college || "—"}</td>
                      <td className="py-2 text-xs">{p.gender || "—"}</td>
                      <td className="py-2 text-xs">{p.org_type || "—"}</td>
                      <td className="py-2 text-muted-foreground text-xs">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-2 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteProfile(p.user_id, p.full_name)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
