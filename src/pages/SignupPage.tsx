import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { CollegePicker } from "@/components/CollegePicker";

type SignupRole = "chapter" | "chapter_member" | "rushee" | "";

export default function SignupPage() {
  const [searchParams] = useSearchParams();
  const defaultRole = (searchParams.get("role") as SignupRole) || "";
  const [role, setRole] = useState<SignupRole>(
    ["chapter", "chapter_member", "rushee"].includes(defaultRole) ? defaultRole : ""
  );
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [college, setCollege] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [orgType, setOrgType] = useState<"fraternity" | "sorority" | "">("");
  const [chapterName, setChapterName] = useState("");
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [availableChapters, setAvailableChapters] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkingName, setCheckingName] = useState(false);
  const [nameAvailable, setNameAvailable] = useState<boolean | null>(null);
  const navigate = useNavigate();

  // For chapter_member: fetch chapters at selected college + org_type
  useEffect(() => {
    if (role !== "chapter_member" || !college || !orgType) {
      setAvailableChapters([]);
      return;
    }
    const fetchChapters = async () => {
      const { data } = await supabase
        .from("chapters")
        .select("id, name")
        .eq("college", college)
        .eq("org_type", orgType)
        .order("name");
      setAvailableChapters(data ?? []);
    };
    fetchChapters();
  }, [role, college, orgType]);

  // For chapter creator: check name availability
  useEffect(() => {
    if (role !== "chapter" || !chapterName.trim() || !college) {
      setNameAvailable(null);
      return;
    }
    const timer = setTimeout(async () => {
      setCheckingName(true);
      const { data } = await supabase
        .from("chapters")
        .select("id")
        .eq("name", chapterName.trim())
        .eq("college", college)
        .maybeSingle();
      setNameAvailable(!data);
      setCheckingName(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [role, chapterName, college]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      toast.error("Please select a role");
      return;
    }
    if (!college) {
      toast.error("Please select your college");
      return;
    }
    if (role === "rushee" && !gender) {
      toast.error("Please select your gender");
      return;
    }
    if ((role === "chapter" || role === "chapter_member") && !orgType) {
      toast.error("Please select Fraternity or Sorority");
      return;
    }
    if (role === "chapter" && !chapterName.trim()) {
      toast.error("Please enter your chapter name");
      return;
    }
    if (role === "chapter" && nameAvailable === false) {
      toast.error("That chapter name is already taken at this college");
      return;
    }
    if (role === "chapter_member" && !selectedChapterId) {
      toast.error("Please select a chapter to join");
      return;
    }

    setLoading(true);

    // Both chapter and chapter_member use profile role = "chapter"
    const profileRole = role === "rushee" ? "rushee" : "chapter";

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: profileRole,
          full_name: fullName,
          college,
          gender,
          org_type: orgType,
        },
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      try {
        if (role === "chapter") {
          // Create the chapter entity
          const { data: chapterData, error: chapterErr } = await supabase
            .from("chapters")
            .insert({
              name: chapterName.trim(),
              college,
              org_type: orgType,
              created_by: data.user.id,
            })
            .select("id")
            .single();

          if (chapterErr) throw chapterErr;

          // Add self as admin member
          await supabase.from("chapter_members").insert({
            chapter_id: chapterData.id,
            user_id: data.user.id,
            role: "admin",
            status: "approved",
          });

          // Update profile with chapter_id
          await supabase
            .from("profiles")
            .update({ chapter_id: chapterData.id })
            .eq("user_id", data.user.id);

        } else if (role === "chapter_member") {
          // Request to join existing chapter
          await supabase.from("chapter_members").insert({
            chapter_id: selectedChapterId,
            user_id: data.user.id,
            role: "member",
            status: "pending",
          });

          // Update profile with chapter_id
          await supabase
            .from("profiles")
            .update({ chapter_id: selectedChapterId })
            .eq("user_id", data.user.id);
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to set up chapter");
        setLoading(false);
        return;
      }

      toast.success(
        role === "chapter_member"
          ? "Account created! Your join request is pending approval."
          : "Account created! Redirecting…"
      );
      navigate(role === "rushee" ? "/rushee" : "/dashboard", { replace: true });
    }
    setLoading(false);
  };

  // Role selection screen
  if (!role) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-lg p-8 shadow-warm">
          <div className="flex items-center gap-2 mb-8 justify-center">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm font-display">G</span>
            </div>
            <span className="text-xl font-display font-bold text-foreground">GreekBid</span>
          </div>

          <h1 className="text-2xl font-display font-bold text-foreground text-center mb-2">Join GreekBid</h1>
          <p className="text-muted-foreground text-center mb-8 text-sm">How will you be using GreekBid?</p>

          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setRole("chapter")}
              className="p-5 rounded-xl border-2 border-border bg-card hover:border-primary hover:bg-accent transition-all text-center space-y-2"
            >
              <span className="text-3xl">🏛️</span>
              <p className="font-display font-semibold text-foreground text-sm">Create Chapter</p>
              <p className="text-xs text-muted-foreground">Register your chapter</p>
            </button>
            <button
              onClick={() => setRole("chapter_member")}
              className="p-5 rounded-xl border-2 border-border bg-card hover:border-primary hover:bg-accent transition-all text-center space-y-2"
            >
              <span className="text-3xl">👥</span>
              <p className="font-display font-semibold text-foreground text-sm">Join Chapter</p>
              <p className="text-xs text-muted-foreground">Join an existing chapter</p>
            </button>
            <button
              onClick={() => setRole("rushee")}
              className="p-5 rounded-xl border-2 border-border bg-card hover:border-primary hover:bg-accent transition-all text-center space-y-2"
            >
              <span className="text-3xl">🎓</span>
              <p className="font-display font-semibold text-foreground text-sm">I'm Rushing</p>
              <p className="text-xs text-muted-foreground">Find your chapter</p>
            </button>
          </div>
        </Card>
      </div>
    );
  }

  const roleLabel =
    role === "chapter" ? "Create Chapter Account" :
    role === "chapter_member" ? "Join a Chapter" :
    "Create Rushee Account";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 shadow-warm">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm font-display">G</span>
          </div>
          <span className="text-xl font-display font-bold text-foreground">GreekBid</span>
        </div>

        <h1 className="text-2xl font-display font-bold text-foreground text-center mb-1">{roleLabel}</h1>
        <p className="text-muted-foreground text-center mb-6 text-sm">
          <button onClick={() => setRole("")} className="text-primary hover:underline">← Change role</button>
        </p>

        <form onSubmit={handleSignup} className="space-y-4">
          {role !== "chapter" && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" minLength={6} required />
          </div>

          <div className="space-y-2">
            <Label>College</Label>
            <CollegePicker value={college} onChange={setCollege} />
          </div>

          {/* Gender for rushees */}
          {role === "rushee" && (
            <div className="space-y-2">
              <Label>Gender</Label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setGender("male")}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${gender === "male" ? "border-primary bg-primary/10 text-primary font-semibold" : "border-border bg-card hover:border-primary/50 text-foreground"}`}>
                  ♂ Male
                </button>
                <button type="button" onClick={() => setGender("female")}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${gender === "female" ? "border-primary bg-primary/10 text-primary font-semibold" : "border-border bg-card hover:border-primary/50 text-foreground"}`}>
                  ♀ Female
                </button>
              </div>
            </div>
          )}

          {/* Org type for chapter roles */}
          {(role === "chapter" || role === "chapter_member") && (
            <div className="space-y-2">
              <Label>Organization Type</Label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setOrgType("fraternity")}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${orgType === "fraternity" ? "border-primary bg-primary/10 text-primary font-semibold" : "border-border bg-card hover:border-primary/50 text-foreground"}`}>
                  🏛️ Fraternity
                </button>
                <button type="button" onClick={() => setOrgType("sorority")}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${orgType === "sorority" ? "border-primary bg-primary/10 text-primary font-semibold" : "border-border bg-card hover:border-primary/50 text-foreground"}`}>
                  🏛️ Sorority
                </button>
              </div>
            </div>
          )}

          {/* Chapter name for chapter creators */}
          {role === "chapter" && (
            <div className="space-y-2">
              <Label>Chapter Name</Label>
              <Input
                value={chapterName}
                onChange={(e) => setChapterName(e.target.value)}
                placeholder="e.g. Sigma Alpha Epsilon"
                required
              />
              {college && chapterName.trim() && (
                <p className={`text-xs ${checkingName ? "text-muted-foreground" : nameAvailable ? "text-green-600" : "text-destructive"}`}>
                  {checkingName ? "Checking availability…" : nameAvailable ? "✓ Name available" : "✗ Name already taken at this college"}
                </p>
              )}
            </div>
          )}

          {/* Chapter picker for chapter members */}
          {role === "chapter_member" && college && orgType && (
            <div className="space-y-2">
              <Label>Select Chapter</Label>
              {availableChapters.length === 0 ? (
                <p className="text-sm text-muted-foreground">No {orgType === "fraternity" ? "fraternities" : "sororities"} registered at this college yet.</p>
              ) : (
                <select
                  value={selectedChapterId}
                  onChange={(e) => setSelectedChapterId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                >
                  <option value="">Choose a chapter…</option>
                  {availableChapters.map((ch) => (
                    <option key={ch.id} value={ch.id}>{ch.name}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading || (role === "chapter" && nameAvailable === false)}>
            {loading ? "Creating account…" : role === "chapter_member" ? "Request to Join" : "Create Account"}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">or</span></div>
        </div>

        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={async () => {
            const result = await lovable.auth.signInWithOAuth("google", {
              redirect_uri: window.location.origin,
            });
            if (result.error) {
              toast.error("Google sign-in failed");
            }
          }}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continue with Google
        </Button>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">Log in</Link>
        </p>
      </Card>
    </div>
  );
}
