import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function BillingCancelPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-display mb-2">Checkout canceled</h1>
        <p className="text-muted-foreground font-body mb-6">
          No worries — you can subscribe anytime from your billing page.
        </p>
        <Button onClick={() => navigate("/dashboard/billing")}>Back to Billing</Button>
      </Card>
    </div>
  );
}
