import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Plus, Trash2, Save, Loader2, StickyNote } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Note {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface NotesPanelProps {
  subjectId: string;
  subjectType: "rushee" | "chapter";
  subjectName?: string;
}

export default function NotesPanel({ subjectId, subjectType, subjectName }: NotesPanelProps) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const fetchNotes = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("rush_notes" as any)
      .select("*")
      .eq("author_id", user.id)
      .eq("subject_id", subjectId)
      .eq("subject_type", subjectType)
      .order("created_at", { ascending: false });
    setNotes((data as any as Note[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotes();
  }, [user, subjectId]);

  const handleAdd = async () => {
    if (!user || !newNote.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("rush_notes" as any).insert({
      author_id: user.id,
      subject_id: subjectId,
      subject_type: subjectType,
      content: newNote.trim(),
    } as any);
    if (error) {
      toast.error("Failed to save note");
    } else {
      toast.success("Note added");
      setNewNote("");
      fetchNotes();
    }
    setSaving(false);
  };

  const handleUpdate = async (id: string) => {
    setSaving(true);
    const { error } = await supabase
      .from("rush_notes" as any)
      .update({ content: editContent, updated_at: new Date().toISOString() } as any)
      .eq("id", id);
    if (error) {
      toast.error("Failed to update");
    } else {
      toast.success("Note updated");
      setEditingId(null);
      fetchNotes();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("rush_notes" as any).delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete");
    } else {
      setNotes((prev) => prev.filter((n) => n.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {subjectName && (
        <p className="text-sm text-muted-foreground">
          Notes about <span className="font-medium text-foreground">{subjectName}</span>
        </p>
      )}

      {/* Add new note */}
      <div className="space-y-2">
        <Textarea
          placeholder="Write a note…"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          rows={2}
        />
        <Button
          size="sm"
          onClick={handleAdd}
          disabled={saving || !newNote.trim()}
          className="gap-2"
        >
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
          Add Note
        </Button>
      </div>

      {/* Notes list */}
      {notes.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <StickyNote className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No notes yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <Card key={note.id} className="p-4 bg-accent/30">
              {editingId === note.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleUpdate(note.id)} disabled={saving} className="gap-1">
                      <Save className="w-3 h-3" /> Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{note.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">
                      {new Date(note.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                        onClick={() => {
                          setEditingId(note.id);
                          setEditContent(note.content);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                        onClick={() => handleDelete(note.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
