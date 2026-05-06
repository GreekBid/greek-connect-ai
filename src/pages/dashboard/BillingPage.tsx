import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Check, RefreshCw, ExternalLink, Sparkles } from "lucide-react";

const FEATURES = [
  "Manage bids and bid pipeline",
  "Vote on rushee rankings",
  "Create and manage events",
  "Send broadcasts and direct messages",
  "Approve chapter members",
  "Star and favorite rushees",
];

export default function BillingPage() {
  const { subscribed, subscriptionEnd, discount, cancelAtPeriodEnd, refreshSubscription, subscriptionLoading } = useAuth();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    refreshSubscription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (e: any) {
      toast({ title: "Checkout error", description: e.message, variant: "destructive" });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (e: any) {
      toast({ title: "Portal error", description: e.message, variant: "destructive" });
    } finally {
      setPortalLoading(false);
    }
  };

  const renewalLabel = subscriptionEnd
    ? new Date(subscriptionEnd).toLocaleDateString(undefined, { dateStyle: "long" })
    : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display">Billing</h1>
          <p className="text-muted-foreground font-body mt-1">
            Manage your GreekBid Premium subscription.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refreshSubscription} disabled={subscriptionLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${subscriptionLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-display">GreekBid Premium</h2>
              {subscribed && <Badge className="bg-primary text-primary-foreground">Active</Badge>}
            </div>
            <p className="text-3xl font-bold mt-3">
              $19.99 <span className="text-base font-normal text-muted-foreground">/ month</span>
            </p>
          </div>
        </div>

        <ul className="space-y-2 mb-6">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm font-body">
              <Check className="h-4 w-4 text-primary shrink-0" />
              {f}
            </li>
          ))}
        </ul>

        {subscribed ? (
          <div className="space-y-4">
            {discount && (
              <div className="rounded-md bg-secondary/40 border border-border p-4 text-sm font-body">
                <strong>Discount applied:</strong> {discount.name || `${discount.percent_off}% off`}
                {discount.code && <> — code <code className="bg-background px-1.5 py-0.5 rounded">{discount.code}</code></>}
                {discount.duration === "repeating" && discount.duration_in_months && (
                  <> for {discount.duration_in_months} months</>
                )}
                {discount.duration === "forever" && <> forever</>}
              </div>
            )}
            {renewalLabel && (
              <p className="text-sm text-muted-foreground font-body">
                {cancelAtPeriodEnd ? "Cancels on" : "Renews on"} <strong>{renewalLabel}</strong>
              </p>
            )}
            <Button onClick={handlePortal} disabled={portalLoading} variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              Manage Subscription
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Button onClick={handleCheckout} disabled={checkoutLoading} size="lg">
              Subscribe — $19.99/mo
            </Button>
            <p className="text-xs text-muted-foreground font-body">
              Have a promo code? Enter it on the next screen — try{" "}
              <code className="bg-secondary/60 px-1.5 py-0.5 rounded">GREEKBID29</code> for 3 months free.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
