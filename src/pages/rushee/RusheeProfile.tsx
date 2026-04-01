import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Camera, Instagram, Twitter, Linkedin, Save, Loader2, GraduationCap } from "lucide-react";
import { CollegePicker } from "@/components/CollegePicker";

interface ProfileData {
  full_name: string;
  bio: string;
  major: string;
  hometown: string;
  college: string;
  gender: string;
  instagram: string;
  twitter: string;
  snapchat: string;
  tiktok: string;
  linkedin: string;
  avatar_url: string | null;
}

export default function RusheeProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    full_name: "",
    bio: "",
    major: "",
    hometown: "",
    college: "",
    gender: "",
    instagram: "",
    twitter: "",
    snapchat: "",
    tiktok: "",
    linkedin: "",
    avatar_url: null,
  });

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name, bio, major, hometown, college, gender, instagram, twitter, snapchat, tiktok, linkedin, avatar_url")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setProfile({
            full_name: data.full_name || "",
            bio: (data as any).bio || "",
            major: (data as any).major || "",
            hometown: (data as any).hometown || "",
            college: (data as any).college || "",
            gender: (data as any).gender || "",
            instagram: (data as any).instagram || "",
            twitter: (data as any).twitter || "",
            snapchat: (data as any).snapchat || "",
            tiktok: (data as any).tiktok || "",
            linkedin: (data as any).linkedin || "",
            avatar_url: data.avatar_url,
          });
        }
        setLoading(false);
      });
  }, [user]);

  const handleChange = (field: keyof ProfileData, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error("Upload failed");
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    setProfile((prev) => ({ ...prev, avatar_url: publicUrl }));
    
    await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl } as any)
      .eq("user_id", user.id);

    toast.success("Photo updated!");
    setUploading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const updateData: any = {
      full_name: profile.full_name,
      bio: profile.bio,
      major: profile.major,
      hometown: profile.hometown,
      college: profile.college,
      instagram: profile.instagram,
      twitter: profile.twitter,
      snapchat: profile.snapchat,
      tiktok: profile.tiktok,
      linkedin: profile.linkedin,
    };
    // Only allow setting gender once (when it's currently empty in DB)
    if (profile.gender) {
      // Check if gender was already set in DB
      const { data: current } = await supabase
        .from("profiles")
        .select("gender")
        .eq("user_id", user.id)
        .single();
      if (!(current as any)?.gender) {
        updateData.gender = profile.gender;
      }
    }

    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to save profile");
    } else {
      toast.success("Profile saved!");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const initials = profile.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground mt-1">This is what chapters will see about you.</p>
      </div>

      {/* Photo & Name */}
      <Card className="p-6 bg-card shadow-warm">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <Avatar className="w-24 h-24 border-2 border-border">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-2xl font-display bg-accent text-primary">
                {initials || "?"}
              </AvatarFallback>
            </Avatar>
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              {uploading ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Camera className="w-5 h-5 text-white" />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={uploading}
              />
            </label>
          </div>
          <div className="flex-1 space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={profile.full_name}
              onChange={(e) => handleChange("full_name", e.target.value)}
              placeholder="Your full name"
            />
          </div>
        </div>
      </Card>

      {/* Bio */}
      <Card className="p-6 bg-card shadow-warm space-y-4">
        <h2 className="font-display font-semibold text-foreground text-lg">About You</h2>
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={profile.bio}
            onChange={(e) => handleChange("bio", e.target.value)}
            placeholder="Tell chapters a bit about yourself…"
            rows={3}
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="major">Major</Label>
            <Input
              id="major"
              value={profile.major}
              onChange={(e) => handleChange("major", e.target.value)}
              placeholder="e.g. Computer Science"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hometown">Hometown</Label>
            <Input
              id="hometown"
              value={profile.hometown}
              onChange={(e) => handleChange("hometown", e.target.value)}
              placeholder="e.g. Austin, TX"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2"><GraduationCap className="w-4 h-4" /> College</Label>
          <CollegePicker value={profile.college} onChange={(v) => handleChange("college", v)} />
        </div>
        <div className="space-y-2">
          <Label>Gender</Label>
          {profile.gender ? (
            <div className="flex items-center gap-2 rounded-md border border-input bg-muted/50 px-3 py-2">
              <span className="text-sm text-foreground">{profile.gender === "male" ? "♂ Male" : "♀ Female"}</span>
              <span className="text-xs text-muted-foreground ml-auto">Locked</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleChange("gender", "male")}
                className="p-3 rounded-lg border-2 border-border bg-card hover:border-primary/50 text-foreground text-center transition-all"
              >
                ♂ Male
              </button>
              <button
                type="button"
                onClick={() => handleChange("gender", "female")}
                className="p-3 rounded-lg border-2 border-border bg-card hover:border-primary/50 text-foreground text-center transition-all"
              >
                ♀ Female
              </button>
            </div>
          )}
          {!profile.gender && <p className="text-xs text-destructive">⚠️ Once saved, gender cannot be changed.</p>}
        </div>
      </Card>

      {/* Socials */}
      <Card className="p-6 bg-card shadow-warm space-y-4">
        <h2 className="font-display font-semibold text-foreground text-lg">Social Links</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="instagram" className="flex items-center gap-2">
              <Instagram className="w-4 h-4" /> Instagram
            </Label>
            <Input
              id="instagram"
              value={profile.instagram}
              onChange={(e) => handleChange("instagram", e.target.value)}
              placeholder="@username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="twitter" className="flex items-center gap-2">
              <Twitter className="w-4 h-4" /> X / Twitter
            </Label>
            <Input
              id="twitter"
              value={profile.twitter}
              onChange={(e) => handleChange("twitter", e.target.value)}
              placeholder="@username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="snapchat" className="flex items-center gap-2">
              📷 Snapchat
            </Label>
            <Input
              id="snapchat"
              value={profile.snapchat}
              onChange={(e) => handleChange("snapchat", e.target.value)}
              placeholder="username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tiktok" className="flex items-center gap-2">
              🎵 TikTok
            </Label>
            <Input
              id="tiktok"
              value={profile.tiktok}
              onChange={(e) => handleChange("tiktok", e.target.value)}
              placeholder="@username"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="linkedin" className="flex items-center gap-2">
              <Linkedin className="w-4 h-4" /> LinkedIn
            </Label>
            <Input
              id="linkedin"
              value={profile.linkedin}
              onChange={(e) => handleChange("linkedin", e.target.value)}
              placeholder="linkedin.com/in/yourprofile"
            />
          </div>
        </div>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto gap-2">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save Profile
      </Button>
    </div>
  );
}
