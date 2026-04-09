import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function UnsubscribePage() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<"loading" | "valid" | "invalid" | "done" | "already" | "error">("loading");

  useEffect(() => {
    if (!token) { setStatus("invalid"); return; }
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    fetch(`${supabaseUrl}/functions/v1/handle-email-unsubscribe?token=${token}`, {
      headers: { apikey: anonKey },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.valid === false && d.reason === "already_unsubscribed") setStatus("already");
        else if (d.valid) setStatus("valid");
        else setStatus("invalid");
      })
      .catch(() => setStatus("invalid"));
  }, [token]);

  const handleUnsubscribe = async () => {
    const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", {
      body: { token },
    });
    if (error) { setStatus("error"); return; }
    if (data?.success) setStatus("done");
    else if (data?.reason === "already_unsubscribed") setStatus("already");
    else setStatus("error");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-4">
        {status === "loading" && <p className="text-muted-foreground">Loading…</p>}
        {status === "invalid" && <p className="text-destructive">Invalid or expired unsubscribe link.</p>}
        {status === "valid" && (
          <>
            <h1 className="text-xl font-display font-bold text-foreground">Unsubscribe</h1>
            <p className="text-muted-foreground">Click below to stop receiving emails from GreekBid.</p>
            <Button onClick={handleUnsubscribe}>Confirm Unsubscribe</Button>
          </>
        )}
        {status === "done" && <p className="text-foreground font-semibold">You've been unsubscribed successfully.</p>}
        {status === "already" && <p className="text-muted-foreground">You're already unsubscribed.</p>}
        {status === "error" && <p className="text-destructive">Something went wrong. Please try again.</p>}
      </Card>
    </div>
  );
}
