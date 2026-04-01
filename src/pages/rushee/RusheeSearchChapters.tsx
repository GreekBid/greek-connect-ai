import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Search, Star, Loader2, Instagram, Twitter, Linkedin, MapPin, GraduationCap, BookOpen,
} from "lucide-react";

interface ChapterProfile {
  user_id: string;
  full_name: string;
  bio: string;
  college: string;
  avatar_url: string | null;
  instagram: string;
  twitter: string;
  linkedin: string;
  org_type: string;
  major: string;
  hometown: string;
}

export default function RusheeSearchChapters() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [chapters, setChapters] = useState<ChapterProfile[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [selectedChapter, setSelectedChapter] = useState<ChapterProfile | null>(null);
  const [togglingFav, setTogglingFav] = useState<string | null>(null);
  const [myGender, setMyGender] = useState<string>("");

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);

    // Get my profile for gender and college
    const { data: myProfile } = await supabase
      .from("profiles")
      .select("gender, college, org_type")
      .eq("user_id", user.id)
      .single();

    const gender = (myProfile as any)?.gender || "";
    setMyGender(gender);
    const college = (myProfile as any)?.college || "";
    const expectedOrgType = gender === "male" ? "fraternity" : "sorority";

    // Get chapters at same college with matching org_type
    const { data: chapterData } = await supabase
      .from("profiles")
      .select("user_id, full_name, bio, college, avatar_url, instagram, twitter, linkedin, org_type, major, hometown")
      .eq("role", "chapter")
      .eq("college", college)
      .eq("org_type", expectedOrgType);

    setChapters((chapterData as any[]) || []);

    // Get my favorites
    const { data: favData } = await supabase
      .from("rushee_favorites")
      .select("chapter_user_id")
      .eq("rushee_id", user.id);

    setFavorites(new Set((favData || []).map((f: any) => f.chapter_user_id)));
    setLoading(false);
  };

  const toggleFavorite = async (chapterUserId: string) => {
    if (!user) return;
    setTogglingFav(chapterUserId);

    const isFav = favorites.has(chapterUserId);

    if (isFav) {
      await supabase
        .from("rushee_favorites")
        .delete()
        .eq("rushee_id", user.id)
        .eq("chapter_user_id", chapterUserId);

      setFavorites((prev) => {
        const next = new Set(prev);
        next.delete(chapterUserId);
        return next;
      });
      toast.success("Removed from favorites");
    } else {
      await (supabase.from("rushee_favorites") as any).insert({
        rushee_id: user.id,
        chapter_user_id: chapterUserId,
      });

      setFavorites((prev) => new Set(prev).add(chapterUserId));

      // Send notification message to the chapter
      const myProfile = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .single();

      const name = myProfile.data?.full_name || "A rushee";
      const orgLabel = myGender === "male" ? "fraternity" : "sorority";

      // Create a direct message notification
      const { data: msg } = await supabase
        .from("direct_messages")
        .insert({
          sender_id: user.id,
          content: `⭐ ${name} has favorited your ${orgLabel}! Check out their profile.`,
          message_type: "direct",
        } as any)
        .select("id")
        .single();

      if (msg) {
        await (supabase.from("direct_message_recipients") as any).insert({
          message_id: msg.id,
          recipient_id: chapterUserId,
        });
      }

      toast.success("Added to favorites!");
    }

    setTogglingFav(null);
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return chapters;
    const q = search.toLowerCase();
    return chapters.filter(
      (c) =>
        c.full_name.toLowerCase().includes(q) ||
        (c.bio || "").toLowerCase().includes(q)
    );
  }, [chapters, search]);

  const orgLabel = myGender === "female" ? "Sororities" : "Fraternities";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const initials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Search {orgLabel}
        </h1>
        <p className="text-muted-foreground mt-1">
          Find and favorite {orgLabel.toLowerCase()} at your college.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={`Search ${orgLabel.toLowerCase()}…`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="p-8 bg-card text-center">
          <p className="text-muted-foreground">
            {chapters.length === 0
              ? `No ${orgLabel.toLowerCase()} found at your college yet.`
              : "No results match your search."}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filtered.map((chapter) => {
            const isFav = favorites.has(chapter.user_id);
            return (
              <Card
                key={chapter.user_id}
                className="p-4 bg-card shadow-warm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedChapter(chapter)}
              >
                <div className="flex items-center gap-4">
                  <Avatar className="w-14 h-14 border border-border">
                    <AvatarImage src={chapter.avatar_url || undefined} />
                    <AvatarFallback className="font-display bg-accent text-primary">
                      {initials(chapter.full_name) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-foreground truncate">
                      {chapter.full_name}
                    </h3>
                    {chapter.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {chapter.bio}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {chapter.org_type === "fraternity" ? "Fraternity" : "Sorority"}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant={isFav ? "default" : "outline"}
                    className="shrink-0"
                    disabled={togglingFav === chapter.user_id}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(chapter.user_id);
                    }}
                  >
                    {togglingFav === chapter.user_id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Star
                        className={`w-4 h-4 ${isFav ? "fill-current" : ""}`}
                      />
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Favorites section */}
      {favorites.size > 0 && (
        <div className="space-y-3">
          <h2 className="font-display font-semibold text-foreground text-lg flex items-center gap-2">
            <Star className="w-5 h-5 text-primary fill-primary" /> My Favorites
          </h2>
          <div className="grid gap-3">
            {chapters
              .filter((c) => favorites.has(c.user_id))
              .map((chapter) => (
                <Card
                  key={`fav-${chapter.user_id}`}
                  className="p-3 bg-accent/30 border-primary/20 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedChapter(chapter)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border border-primary/30">
                      <AvatarImage src={chapter.avatar_url || undefined} />
                      <AvatarFallback className="font-display bg-primary/10 text-primary text-sm">
                        {initials(chapter.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-foreground">{chapter.full_name}</span>
                    <Star className="w-4 h-4 text-primary fill-primary ml-auto" />
                  </div>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Chapter Profile Dialog */}
      <Dialog open={!!selectedChapter} onOpenChange={() => setSelectedChapter(null)}>
        <DialogContent className="max-w-md">
          {selectedChapter && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display">{selectedChapter.full_name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20 border-2 border-border">
                    <AvatarImage src={selectedChapter.avatar_url || undefined} />
                    <AvatarFallback className="text-2xl font-display bg-accent text-primary">
                      {initials(selectedChapter.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Badge variant="secondary">
                      {selectedChapter.org_type === "fraternity" ? "Fraternity" : "Sorority"}
                    </Badge>
                    <Button
                      size="sm"
                      variant={favorites.has(selectedChapter.user_id) ? "default" : "outline"}
                      className="ml-2 gap-1"
                      disabled={togglingFav === selectedChapter.user_id}
                      onClick={() => toggleFavorite(selectedChapter.user_id)}
                    >
                      {togglingFav === selectedChapter.user_id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Star className={`w-3 h-3 ${favorites.has(selectedChapter.user_id) ? "fill-current" : ""}`} />
                      )}
                      {favorites.has(selectedChapter.user_id) ? "Favorited" : "Favorite"}
                    </Button>
                  </div>
                </div>

                {selectedChapter.bio && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">About</h4>
                    <p className="text-sm text-foreground">{selectedChapter.bio}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 text-sm">
                  {selectedChapter.college && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <GraduationCap className="w-4 h-4" />
                      <span>{selectedChapter.college}</span>
                    </div>
                  )}
                  {selectedChapter.hometown && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedChapter.hometown}</span>
                    </div>
                  )}
                  {selectedChapter.major && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <BookOpen className="w-4 h-4" />
                      <span>{selectedChapter.major}</span>
                    </div>
                  )}
                </div>

                {/* Social links */}
                <div className="flex gap-3">
                  {selectedChapter.instagram && (
                    <a href={`https://instagram.com/${selectedChapter.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {selectedChapter.twitter && (
                    <a href={`https://twitter.com/${selectedChapter.twitter.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                  {selectedChapter.linkedin && (
                    <a href={selectedChapter.linkedin.startsWith("http") ? selectedChapter.linkedin : `https://${selectedChapter.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
