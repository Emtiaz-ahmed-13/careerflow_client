"use client";

import { useState } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { DashboardLayout, PageHeader } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input, Label, Card } from "@/components/ui/input";
import { api, uploadFile } from "@/lib/api/client";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    headline: user?.headline ?? "",
    phone: user?.phone ?? "",
    location: user?.location ?? "",
    linkedinUrl: user?.linkedinUrl ?? "",
    githubUrl: user?.githubUrl ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await api("/users/profile", { method: "PATCH", body: JSON.stringify(form) });
      await refreshUser();
      alert("Profile saved!");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadFile("/users/avatar", file);
      await refreshUser();
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader title="Profile" subtitle="Your identity — used in AI emails & cover letters" />

      <Card className="max-w-xl space-y-4 bg-[var(--color-cyan)]">
        <div className="flex items-center gap-4">
          <div className="neo-border neo-shadow-sm relative h-20 w-20 overflow-hidden bg-white">
            {user?.avatarUrl ? (
              <Image src={user.avatarUrl} alt="Avatar" fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-2xl font-black uppercase">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
            )}
          </div>
          <label className="neo-btn neo-btn-yellow flex cursor-pointer items-center gap-2 px-4 py-2 text-xs">
            <Camera className="h-4 w-4 stroke-[2.5]" />
            {uploading ? "Uploading..." : "Upload Photo"}
            <input type="file" accept="image/*" className="hidden" onChange={uploadPhoto} />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div><Label>First Name</Label><Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="mt-2 bg-white" /></div>
          <div><Label>Last Name</Label><Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="mt-2 bg-white" /></div>
        </div>
        <div><Label>Email</Label><Input value={user?.email ?? ""} disabled className="mt-2 bg-neutral-200" /></div>
        <div><Label>Phone *</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required className="mt-2 bg-white" /></div>
        <div><Label>LinkedIn *</Label><Input value={form.linkedinUrl} onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })} required className="mt-2 bg-white" /></div>
        <div><Label>GitHub *</Label><Input value={form.githubUrl} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} required className="mt-2 bg-white" /></div>
        <div><Label>Headline</Label><Input value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} className="mt-2 bg-white" /></div>
        <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="mt-2 bg-white" /></div>
        <Button variant="lime" onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save Profile →"}
        </Button>
      </Card>
    </DashboardLayout>
  );
}
