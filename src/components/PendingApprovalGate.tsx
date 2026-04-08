import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Clock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: React.ReactNode;
}

export default function PendingApprovalGate({ children }: Props) {
  const { user, signOut } = useAuth();
  const [status, setStatus] = useState<"loading" | "approved" | "pending" | "rejected" | "admin" | "no_membership">("loading");

  useEffect(() => {
    if (!user) return;
    const checkMembership = async () => {
      const { data } = await supabase
        .from("chapter_members")
        .select("status, role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!data) {
        setStatus("no_membership");
      } else if (data.role === "admin") {
        setStatus("admin");
      } else if (data.status === "approved") {
        setStatus("approved");
      } else if (data.status === "rejected") {
        setStatus("rejected");
      } else {
        setStatus("pending");
      }
    };
    checkMembership();
  }, [user]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (status === "admin" || status === "approved" || status === "no_membership") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 shadow-warm text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mx-auto">
          <Clock className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          {status === "rejected" ? "Request Rejected" : "Pending Approval"}
        </h1>
        <p className="text-muted-foreground text-sm">
          {status === "rejected"
            ? "Your request to join this chapter has been rejected. Please contact the chapter admin for more information."
            : "Your request to join this chapter is awaiting approval from the chapter admin. You'll get access once approved."}
        </p>
        <Button variant="ghost" className="gap-2 text-muted-foreground" onClick={() => signOut()}>
          <LogOut className="w-4 h-4" /> Sign Out
        </Button>
      </Card>
    </div>
  );
}
