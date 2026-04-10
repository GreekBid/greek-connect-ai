import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Building2, Loader2 } from "lucide-react";
import NotesPanel from "@/components/NotesPanel";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Chapter {
  id: string;
  name: string;
  letters: string;
}

function getLetters(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function RusheeNotes() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [noProfile, setNoProfile] = useState(false);

  useEffect(() => {
    const fetchChapters = async () => {
      if (!user) return;

      // Get user's college and gender to derive org_type
      const { data: profile } = await supabase
        .from("profiles")
        .select("college, gender")
        .eq("user_id", user.id)
        .single();

      const college = profile?.college || "";
      const gender = profile?.gender || "";
      const orgType = gender === "male" ? "fraternity" : gender === "female" ? "sorority" : "";

      if (!college || !orgType) {
        setNoProfile(true);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("chapters")
        .select("id, name")
        .eq("college", college)
        .eq("org_type", orgType)
        .order("name");
      setChapters(
        (data || []).map((c) => ({
          id: c.id,
          name: c.name,
          letters: getLetters(c.name),
        }))
      );
      setLoading(false);
    };
    fetchChapters();
  }, [user]);

  const filtered = chapters.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">My Notes</h1>
        <p className="text-muted-foreground mt-1">
          Keep private notes on each chapter to help you decide.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search chapters…"
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : noProfile ? (
        <div className="text-center py-12 text-muted-foreground">
          <Building2 className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Please update your profile with your college and gender to see chapters.</p>
        </div>
      ) : chapters.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Building2 className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No chapters registered at your college yet.</p>
        </div>
      ) : (
        <div className="flex gap-6">
          {/* Chapter list */}
          <div className="space-y-3 flex-1">
            {filtered.map((chapter) => (
              <Card
                key={chapter.id}
                className={`p-4 bg-card shadow-warm hover:shadow-warm-lg transition-shadow cursor-pointer flex items-center gap-4 ${
                  selectedChapter?.id === chapter.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() =>
                  setSelectedChapter(selectedChapter?.id === chapter.id ? null : chapter)
                }
              >
                <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center shrink-0">
                  <span className="font-display font-bold text-primary text-sm">
                    {chapter.letters}
                  </span>
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground">{chapter.name}</h3>
                  <p className="text-xs text-muted-foreground">Click to view / add notes</p>
                </div>
              </Card>
            ))}
          </div>

          {/* Notes panel */}
          {selectedChapter && (
            <Card className="w-80 shrink-0 p-5 bg-card shadow-warm self-start sticky top-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground">
                  {selectedChapter.name}
                </h3>
              </div>
              <NotesPanel
                subjectId={selectedChapter.id}
                subjectType="chapter"
                subjectName={selectedChapter.name}
              />
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
