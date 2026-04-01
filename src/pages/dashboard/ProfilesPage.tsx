import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, Search, MapPin, BookOpen, X, Instagram, Linkedin } from "lucide-react";
import { useState, useEffect } from "react";
import NotesPanel from "@/components/NotesPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface RusheeProfile {
  id: string;
  user_id: string;
  full_name: string;
  major: string | null;
  hometown: string | null;
  bio: string | null;
  interests: string[] | null;
  avatar_url: string | null;
  instagram: string | null;
  linkedin: string | null;
  created_at: string;
}

export default function ProfilesPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [profiles, setProfiles] = useState<RusheeProfile[]>([]);
  const [stars, setStars] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<RusheeProfile | null>(null);
  const [filterStarred, setFilterStarred] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const [{ data: profileData }, { data: starData }] = await Promise.all([
        supabase.from("profiles").select("*").eq("role", "rushee").order("created_at", { ascending: false }),
        supabase.from("stars").select("rushee_id").eq("starred_by", user.id),
      ]);
      setProfiles(profileData || []);
      setStars(new Set((starData as any[] || []).map((s: any) => s.rushee_id)));
      setLoading(false);
    };
    load();
  }, [user]);

  const toggleStar = async (rusheeUserId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    if (stars.has(rusheeUserId)) {
      await supabase.from("stars").delete().eq("rushee_id", rusheeUserId).eq("starred_by", user.id);
      setStars((prev) => { const n = new Set(prev); n.delete(rusheeUserId); return n; });
    } else {
      await supabase.from("stars").insert({ rushee_id: rusheeUserId, starred_by: user.id } as any);
      setStars((prev) => new Set(prev).add(rusheeUserId));
    }
  };

  const filtered = profiles
    .filter((p) => !filterStarred || stars.has(p.user_id))
    .filter((p) =>
      p.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (p.major || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.hometown || "").toLowerCase().includes(search.toLowerCase())
    );

  if (loading) return <div className="text-muted-foreground p-8">Loading profiles…</div>;

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Rushee Profiles</h1>
          <p className="text-muted-foreground mt-1">{profiles.length} applicants this cycle</p>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name, major, or hometown..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button variant={filterStarred ? "default" : "outline"} size="sm" className="gap-2" onClick={() => setFilterStarred(!filterStarred)}>
          <Star className={`w-4 h-4 ${filterStarred ? "fill-current" : ""}`} />
          Starred ({stars.size})
        </Button>
      </div>

      {profiles.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No rushee profiles yet — they'll appear here as people sign up.</p>
        </div>
      )}

      <div className="flex gap-6">
        <div className={`grid gap-4 ${selectedProfile ? "md:grid-cols-1 lg:grid-cols-2 flex-1" : "md:grid-cols-2 lg:grid-cols-3 flex-1"}`}>
          {filtered.map((p) => (
            <Card
              key={p.id}
              className={`p-5 bg-card shadow-warm hover:shadow-warm-lg transition-shadow cursor-pointer ${selectedProfile?.id === p.id ? "ring-2 ring-primary" : ""}`}
              onClick={() => setSelectedProfile(selectedProfile?.id === p.id ? null : p)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={p.avatar_url || undefined} />
                    <AvatarFallback className="bg-accent text-accent-foreground font-display font-bold text-sm">
                      {p.full_name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-foreground">{p.full_name}</h3>
                    <Badge variant="secondary" className="text-xs">Rushee</Badge>
                  </div>
                </div>
                <button onClick={(e) => toggleStar(p.user_id, e)} className="p-1 hover:scale-110 transition-transform">
                  <Star className={`w-5 h-5 ${stars.has(p.user_id) ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                </button>
              </div>
              <div className="space-y-2 text-sm">
                {p.major && <div className="flex items-center gap-2 text-muted-foreground"><BookOpen className="w-3.5 h-3.5" /> {p.major}</div>}
                {p.hometown && <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-3.5 h-3.5" /> {p.hometown}</div>}
                {p.interests && p.interests.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {p.interests.map((i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-xs">{i}</span>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {selectedProfile && (
          <Card className="w-80 shrink-0 p-5 bg-card shadow-warm self-start sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-foreground">{selectedProfile.full_name}</h3>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setSelectedProfile(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <Tabs defaultValue="notes">
              <TabsList className="w-full">
                <TabsTrigger value="notes" className="flex-1">Notes</TabsTrigger>
                <TabsTrigger value="info" className="flex-1">Info</TabsTrigger>
              </TabsList>
              <TabsContent value="notes" className="mt-4">
                <NotesPanel subjectId={selectedProfile.user_id} subjectType="rushee" />
              </TabsContent>
              <TabsContent value="info" className="mt-4 space-y-3 text-sm">
                {selectedProfile.bio && <div><span className="text-muted-foreground">Bio:</span> <span className="text-foreground">{selectedProfile.bio}</span></div>}
                {selectedProfile.major && <div><span className="text-muted-foreground">Major:</span> <span className="text-foreground">{selectedProfile.major}</span></div>}
                {selectedProfile.hometown && <div><span className="text-muted-foreground">Hometown:</span> <span className="text-foreground">{selectedProfile.hometown}</span></div>}
                {selectedProfile.instagram && (
                  <a href={`https://instagram.com/${selectedProfile.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                    <Instagram className="w-3.5 h-3.5" /> @{selectedProfile.instagram}
                  </a>
                )}
                {selectedProfile.linkedin && (
                  <a href={selectedProfile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                    <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                  </a>
                )}
                {selectedProfile.interests && selectedProfile.interests.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Interests:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {selectedProfile.interests.map((i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-xs">{i}</span>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </Card>
        )}
      </div>
    </div>
  );
}
