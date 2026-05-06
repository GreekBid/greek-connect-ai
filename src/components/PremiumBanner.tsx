import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PremiumBanner() {
  const { role, isAdmin, subscribed, subscriptionLoading } = useAuth();
  if (isAdmin || role !== "chapter" || subscribed || subscriptionLoading) return null;

  return (
    <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-2 text-sm font-body">
        <Sparkles className="h-4 w-4 text-primary shrink-0" />
        <span>
          <strong>Read-only mode.</strong> Upgrade to Premium ($19.99/mo) to manage bids, events,
          and members. Have a code? Apply at checkout.
        </span>
      </div>
      <Button asChild size="sm">
        <Link to="/dashboard/billing">Upgrade</Link>
      </Button>
    </div>
  );
}
