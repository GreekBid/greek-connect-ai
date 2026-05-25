import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { loginSchema, parseOrToast } from "@/lib/schemas";


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const navigate = useNavigate();

  const handleResend = async () => {
    if (!email) return;
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) toast.error(error.message);
    else toast.success("Verification email sent. Check your inbox.");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = parseOrToast(loginSchema, { email, password });
    if (!valid) return;
    setLoading(true);
    setNeedsVerification(false);
    const { data, error } = await supabase.auth.signInWithPassword({ email: valid.email, password: valid.password });

    setLoading(false);
    if (error) {
      if (/confirm/i.test(error.message) || /verif/i.test(error.message)) {
        setNeedsVerification(true);
        toast.error("Please verify your email first.");
      } else {
        toast.error(error.message);
      }
      return;
    }
    if (!data.user) return;

    // Admins go to /admin regardless of profile role
    const { data: adminRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (adminRow) {
      navigate("/admin", { replace: true });
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", data.user.id)
      .single();
    const role = profile?.role;
    navigate(role === "chapter" ? "/dashboard" : "/rushee", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 shadow-warm">
        <div className="flex justify-center mb-8">
          <img src="/logo.png" alt="GreekBid" className="h-20 w-auto" />
        </div>

        <h1 className="text-2xl font-display font-bold text-foreground text-center mb-2">Welcome back</h1>
        <p className="text-muted-foreground text-center mb-6 text-sm">Log in to your account</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
          {needsVerification && (
            <Button type="button" variant="outline" className="w-full" onClick={handleResend}>
              Resend verification email
            </Button>
          )}
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary font-medium hover:underline">Sign up</Link>
        </p>
      </Card>
    </div>
  );
}
