import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Building2 } from "lucide-react";
import NotesPanel from "@/components/NotesPanel";

// Mock chapters the rushee is interacting with — will be replaced with real data
const mockChapters = [
  { id: "chapter-1", name: "Alpha Beta Gamma", letters: "ABG" },
  { id: "chapter-2", name: "Delta Epsilon", letters: "DE" },
  { id: "chapter-3", name: "Kappa Sigma", letters: "KΣ" },
  { id: "chapter-4", name: "Phi Delta Theta", letters: "ΦΔΘ" },
];

export default function RusheeNotes() {
  const [search, setSearch] = useState("");
  const [selectedChapter, setSelectedChapter] = useState<typeof mockChapters[0] | null>(null);
  const filtered = mockChapters.filter((c) =>
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
    </div>
  );
}
