import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, Search, Filter, MapPin, BookOpen, Instagram } from "lucide-react";
import { useState } from "react";

const mockProfiles = [
  { id: 1, name: "Jake Martinez", major: "Business", hometown: "Austin, TX", gpa: "3.7", interests: ["Basketball", "Finance", "Gaming"], starred: true, notes: "Great conversationalist, leadership potential", status: "Active" },
  { id: 2, name: "Emily Chen", major: "Computer Science", hometown: "San Jose, CA", gpa: "3.9", interests: ["Coding", "Hiking", "Photography"], starred: true, notes: "Very involved on campus, strong GPA", status: "Active" },
  { id: 3, name: "Marcus Williams", major: "Pre-Med", hometown: "Chicago, IL", gpa: "3.5", interests: ["Volunteering", "Track", "Music"], starred: false, notes: "", status: "Active" },
  { id: 4, name: "Sofia Ramirez", major: "Communications", hometown: "Miami, FL", gpa: "3.6", interests: ["Social Media", "Dance", "Travel"], starred: false, notes: "Outgoing personality", status: "New" },
  { id: 5, name: "Tyler Johnson", major: "Engineering", hometown: "Denver, CO", gpa: "3.8", interests: ["Robotics", "Skiing", "Cooking"], starred: true, notes: "Strong technical background", status: "Active" },
  { id: 6, name: "Aisha Patel", major: "Psychology", hometown: "Atlanta, GA", gpa: "3.4", interests: ["Yoga", "Reading", "Art"], starred: false, notes: "", status: "New" },
];

export default function ProfilesPage() {
  const [search, setSearch] = useState("");
  const filtered = mockProfiles.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Rushee Profiles</h1>
          <p className="text-muted-foreground mt-1">{mockProfiles.length} applicants this cycle</p>
        </div>
        <Button variant="hero" size="sm">Export List</Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name, major, or hometown..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button variant="outline" size="default" className="gap-2">
          <Filter className="w-4 h-4" /> Filters
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <Card key={p.id} className="p-5 bg-card shadow-warm hover:shadow-warm-lg transition-shadow cursor-pointer">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center font-display font-bold text-accent-foreground">
                  {p.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{p.name}</h3>
                  <Badge variant={p.status === "New" ? "default" : "secondary"} className="text-xs">{p.status}</Badge>
                </div>
              </div>
              <button className="text-muted-foreground hover:text-primary transition-colors">
                <Star className={`w-5 h-5 ${p.starred ? "fill-primary text-primary" : ""}`} />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <BookOpen className="w-3.5 h-3.5" /> {p.major} · GPA {p.gpa}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" /> {p.hometown}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {p.interests.map((i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-xs">{i}</span>
                ))}
              </div>
              {p.notes && <p className="text-xs text-muted-foreground mt-2 italic">"{p.notes}"</p>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
