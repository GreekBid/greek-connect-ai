import { useState, useMemo, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { US_COLLEGES } from "@/data/colleges";
import { Search, GraduationCap, X } from "lucide-react";

interface CollegePickerProps {
  value: string;
  onChange: (college: string) => void;
}

export function CollegePicker({ value, onChange }: CollegePickerProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return US_COLLEGES.slice(0, 50);
    const q = query.toLowerCase();
    return US_COLLEGES.filter((c) => c.toLowerCase().includes(q)).slice(0, 50);
  }, [query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (value) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2">
        <GraduationCap className="h-4 w-4 text-primary shrink-0" />
        <span className="text-sm flex-1 truncate">{value}</span>
        <button type="button" onClick={() => onChange("")} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search for your college…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="pl-9"
        />
      </div>
      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-md border bg-popover shadow-md">
          {filtered.length === 0 ? (
            <p className="p-3 text-sm text-muted-foreground text-center">No colleges found</p>
          ) : (
            filtered.map((college) => (
              <button
                key={college}
                type="button"
                onClick={() => {
                  onChange(college);
                  setQuery("");
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                {college}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
