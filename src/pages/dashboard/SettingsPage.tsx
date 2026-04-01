import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, Loader2, Shield, Bell, Palette } from "lucide-react";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState({ full_name: "", major: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState({ events: true, messages: true, bids: true });

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name, major").eq("user_id", user.id).single().then(({ data }) => {
      if (data) setProfile({ full_name: data.full_name || "", major: (data as any).major || "" });
      setLoading(false);
    });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ full_name: profile.full_name, major: profile.major } as any).eq("user_id", user.id);
    if (error) toast.error("Failed to save"); else toast.success("Settings saved!");
    setSaving(false);
  };

  if (loading) return <div className="text-muted-foreground p-8">Loading…</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences.</p>
      </div>

      {/* Account */}
      <Card className="p-6 bg-card shadow-warm space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-foreground text-lg">Account</h2>
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={user?.email || ""} disabled className="bg-muted" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Display Name</Label>
            <Input value={profile.full_name} onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Major / Role</Label>
            <Input value={profile.major} onChange={(e) => setProfile((p) => ({ ...p, major: e.target.value }))} />
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-6 bg-card shadow-warm space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Bell className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-foreground text-lg">Notifications</h2>
        </div>
        {([
          { key: "events" as const, label: "Event updates", desc: "Get notified about new events and RSVP changes" },
          { key: "messages" as const, label: "Messages", desc: "Receive chapter broadcast notifications" },
          { key: "bids" as const, label: "Bid updates", desc: "Get notified when your bid status changes" },
        ]).map((item) => (
          <div key={item.key} className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <Switch checked={notifications[item.key]} onCheckedChange={(v) => setNotifications((n) => ({ ...n, [item.key]: v }))} />
          </div>
        ))}
      </Card>

      {/* Appearance */}
      <Card className="p-6 bg-card shadow-warm space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Palette className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-foreground text-lg">Appearance</h2>
        </div>
        <p className="text-sm text-muted-foreground">Theme customization coming soon! RushFlow currently uses a warm, approachable light theme.</p>
      </Card>

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Settings
        </Button>
        <Button variant="outline" onClick={signOut} className="text-destructive hover:text-destructive">
          Sign Out
        </Button>
      </div>
    </div>
  );
}
