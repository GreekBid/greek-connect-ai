import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function BillingSuccessPage() {
  const { refreshSubscription } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    refreshSubscription();
    const t = setTimeout(() => navigate("/dashboard"), 3000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="p-8 max-w-md w-full text-center">
        <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-2xl font-display mb-2">Welcome to Premium!</h1>
        <p className="text-muted-foreground font-body mb-6">
          Your subscription is active. Redirecting you to the dashboard…
        </p>
        <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
      </Card>
    </div>
  );
}
