import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, Loader2, Shield, Bell, Palette, User, Lock, Trash2, Camera } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function RusheeSettings() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState({
    full_name: "", major: "", hometown: "", bio: "",
    instagram: "", twitter: "", snapchat: "", tiktok: "", linkedin: "",
    avatar_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [notifications, setNotifications] = useState({ events: true, messages: true, bids: true, reminders: true });
  const [passwordData, setPasswordData] = useState({ newPassword: "", confirmPassword: "" });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).single().then(({ data }) => {
      if (data) setProfile({
        full_name: data.full_name || "",
        major: data.major || "",
        hometown: data.hometown || "",
        bio: data.bio || "",
        instagram: data.instagram || "",
        twitter: data.twitter || "",
        snapchat: data.snapchat || "",
        tiktok: data.tiktok || "",
        linkedin: data.linkedin || "",
        avatar_url: data.avatar_url || "",
      });
      setLoading(false);
    });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: profile.full_name,
      major: profile.major,
      hometown: profile.hometown,
      bio: profile.bio,
      instagram: profile.instagram,
      twitter: profile.twitter,
      snapchat: profile.snapchat,
      tiktok: profile.tiktok,
      linkedin: profile.linkedin,
    }).eq("user_id", user.id);
    if (error) toast.error("Failed to save"); else toast.success("Settings saved!");
    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be under 2MB"); return; }
    setUploadingAvatar(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (uploadErr) { toast.error("Upload failed"); setUploadingAvatar(false); return; }
    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const avatar_url = urlData.publicUrl + "?t=" + Date.now();
    await supabase.from("profiles").update({ avatar_url }).eq("user_id", user.id);
    setProfile((p) => ({ ...p, avatar_url }));
    toast.success("Photo updated!");
    setUploadingAvatar(false);
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (passwordData.newPassword !== passwordData.confirmPassword) { toast.error("Passwords don't match"); return; }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword });
    setChangingPassword(false);
    if (error) toast.error(error.message); 
    else { toast.success("Password updated!"); setPasswordData({ newPassword: "", confirmPassword: "" }); }
  };

  const initials = profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase() || "?";

  if (loading) return <div className="text-muted-foreground p-8">Loading…</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account, profile, and preferences.</p>
      </div>

      {/* Profile Photo */}
      <Card className="p-6 bg-card shadow-warm">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-foreground text-lg">Profile Photo</h2>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative group">
            <Avatar className="w-20 h-20 border-2 border-border">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-xl bg-accent font-display">{initials}</AvatarFallback>
            </Avatar>
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              {uploadingAvatar ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Camera className="w-5 h-5 text-white" />}
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
            </label>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Upload a new photo</p>
            <p className="text-xs text-muted-foreground mt-1">JPG, PNG under 2MB. Hover over the photo to change it.</p>
          </div>
        </div>
      </Card>

      {/* Account Details */}
      <Card className="p-6 bg-card shadow-warm space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-foreground text-lg">Account Details</h2>
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={user?.email || ""} disabled className="bg-muted" />
          <p className="text-xs text-muted-foreground">Contact support to change your email address.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={profile.full_name} onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))} placeholder="Your name" />
          </div>
          <div className="space-y-2">
            <Label>Major</Label>
            <Input value={profile.major} onChange={(e) => setProfile((p) => ({ ...p, major: e.target.value }))} placeholder="e.g. Computer Science" />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Hometown</Label>
            <Input value={profile.hometown} onChange={(e) => setProfile((p) => ({ ...p, hometown: e.target.value }))} placeholder="e.g. Austin, TX" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Bio</Label>
          <Textarea value={profile.bio} onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))} placeholder="Tell chapters about yourself…" rows={3} />
        </div>
      </Card>

      {/* Social Links */}
      <Card className="p-6 bg-card shadow-warm space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <User className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-foreground text-lg">Social Links</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {([
            { key: "instagram" as const, label: "Instagram", placeholder: "@username" },
            { key: "twitter" as const, label: "Twitter / X", placeholder: "@handle" },
            { key: "snapchat" as const, label: "Snapchat", placeholder: "username" },
            { key: "tiktok" as const, label: "TikTok", placeholder: "@username" },
            { key: "linkedin" as const, label: "LinkedIn", placeholder: "linkedin.com/in/..." },
          ]).map((s) => (
            <div key={s.key} className="space-y-2">
              <Label>{s.label}</Label>
              <Input value={profile[s.key]} onChange={(e) => setProfile((p) => ({ ...p, [s.key]: e.target.value }))} placeholder={s.placeholder} />
            </div>
          ))}
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-6 bg-card shadow-warm space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Bell className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-foreground text-lg">Notifications</h2>
        </div>
        {([
          { key: "events" as const, label: "Event updates", desc: "New events, schedule changes, and RSVP confirmations" },
          { key: "messages" as const, label: "Messages", desc: "Direct messages and chapter announcements" },
          { key: "bids" as const, label: "Bid updates", desc: "Status changes on your bid in the recruitment pipeline" },
          { key: "reminders" as const, label: "Reminders", desc: "Event reminders and deadline notifications" },
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

      {/* Password */}
      <Card className="p-6 bg-card shadow-warm space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-foreground text-lg">Change Password</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData((p) => ({ ...p, newPassword: e.target.value }))} placeholder="••••••••" />
          </div>
          <div className="space-y-2">
            <Label>Confirm Password</Label>
            <Input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData((p) => ({ ...p, confirmPassword: e.target.value }))} placeholder="••••••••" />
          </div>
        </div>
        <Button variant="outline" onClick={handleChangePassword} disabled={changingPassword || !passwordData.newPassword} className="gap-2">
          {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
          Update Password
        </Button>
      </Card>

      {/* Appearance */}
      <Card className="p-6 bg-card shadow-warm space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Palette className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-foreground text-lg">Appearance</h2>
        </div>
        <p className="text-sm text-muted-foreground">Theme customization coming soon! GreekBid currently uses a warm, approachable light theme.</p>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save All Changes
        </Button>
        <Button variant="outline" onClick={signOut} className="text-destructive hover:text-destructive gap-2">
          <Trash2 className="w-4 h-4" /> Sign Out
        </Button>
      </div>
    </div>
  );
}
