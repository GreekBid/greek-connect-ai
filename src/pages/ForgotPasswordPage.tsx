import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
    toast.success("Check your email for a reset link.");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 shadow-warm">
        <div className="flex justify-center mb-8">
          <img src="/logo.png" alt="GreekBid" className="h-20 w-auto" />
        </div>
        <h1 className="text-2xl font-display font-bold text-foreground text-center mb-2">Reset your password</h1>
        <p className="text-muted-foreground text-center mb-6 text-sm">
          Enter your email and we'll send you a link to reset your password.
        </p>

        {sent ? (
          <div className="text-center space-y-4">
            <p className="text-sm text-foreground">
              If an account exists for <strong>{email}</strong>, a reset link is on its way.
            </p>
            <Link to="/login" className="text-sm text-primary hover:underline block">
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending…" : "Send reset link"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              <Link to="/login" className="text-primary hover:underline">Back to login</Link>
            </p>
          </form>
        )}
      </Card>
    </div>
  );
}
