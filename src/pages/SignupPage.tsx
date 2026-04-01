import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { CollegePicker } from "@/components/CollegePicker";

export default function SignupPage() {
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get("role") === "chapter" ? "chapter" : (searchParams.get("role") === "rushee" ? "rushee" : "");
  const [role, setRole] = useState<"chapter" | "rushee" | "">(defaultRole);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [college, setCollege] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      toast.error("Please select whether you're a Chapter or Rushee");
      return;
    }
    if (!college) {
      toast.error("Please select your college");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role, full_name: fullName, college },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data.user) {
      toast.success("Account created! Redirecting…");
      navigate(role === "chapter" ? "/dashboard" : "/rushee", { replace: true });
    }
  };

  if (!role) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-8 shadow-warm">
          <div className="flex items-center gap-2 mb-8 justify-center">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm font-display">R</span>
            </div>
            <span className="text-xl font-display font-bold text-foreground">RushFlow</span>
          </div>

          <h1 className="text-2xl font-display font-bold text-foreground text-center mb-2">Join RushFlow</h1>
          <p className="text-muted-foreground text-center mb-8 text-sm">How will you be using RushFlow?</p>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setRole("chapter")}
              className="p-6 rounded-xl border-2 border-border bg-card hover:border-primary hover:bg-accent transition-all text-center space-y-2"
            >
              <span className="text-3xl">🏛️</span>
              <p className="font-display font-semibold text-foreground">I'm a Chapter</p>
              <p className="text-xs text-muted-foreground">Manage rush & recruitment</p>
            </button>
            <button
              onClick={() => setRole("rushee")}
              className="p-6 rounded-xl border-2 border-border bg-card hover:border-primary hover:bg-accent transition-all text-center space-y-2"
            >
              <span className="text-3xl">🎓</span>
              <p className="font-display font-semibold text-foreground">I'm Rushing</p>
              <p className="text-xs text-muted-foreground">Find your chapter</p>
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 shadow-warm">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm font-display">R</span>
          </div>
          <span className="text-xl font-display font-bold text-foreground">RushFlow</span>
        </div>

        <h1 className="text-2xl font-display font-bold text-foreground text-center mb-1">
          {role === "chapter" ? "Create Chapter Account" : "Create Rushee Account"}
        </h1>
        <p className="text-muted-foreground text-center mb-6 text-sm">
          <button onClick={() => setRole("")} className="text-primary hover:underline">← Change role</button>
        </p>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{role === "chapter" ? "Chapter Name" : "Full Name"}</Label>
            <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={role === "chapter" ? "Alpha Beta Gamma" : "John Doe"} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" minLength={6} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account…" : "Create Account"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">Log in</Link>
        </p>
      </Card>
    </div>
  );
}
