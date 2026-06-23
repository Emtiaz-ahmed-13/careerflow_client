"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input, Label, Card } from "@/components/ui/input";

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    email: "", password: "", firstName: "", lastName: "",
    phone: "", linkedinUrl: "", githubUrl: "", headline: "", location: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await register(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f3f3f3] p-4">
      <Card className="w-full max-w-lg bg-white">
        <h1 className="neo-heading text-2xl">Create Account</h1>
        <p className="mt-2 text-xs font-bold uppercase tracking-wide text-neutral-600">
          LinkedIn · GitHub · Email · Phone required
        </p>
        <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-2 gap-4">
          <div><Label>First Name *</Label><Input value={form.firstName} onChange={set("firstName")} required className="mt-2" /></div>
          <div><Label>Last Name *</Label><Input value={form.lastName} onChange={set("lastName")} required className="mt-2" /></div>
          <div className="col-span-2"><Label>Email *</Label><Input type="email" value={form.email} onChange={set("email")} required className="mt-2" /></div>
          <div className="col-span-2"><Label>Password *</Label><Input type="password" value={form.password} onChange={set("password")} required minLength={6} className="mt-2" /></div>
          <div className="col-span-2"><Label>Phone *</Label><Input value={form.phone} onChange={set("phone")} required className="mt-2" /></div>
          <div className="col-span-2"><Label>LinkedIn *</Label><Input value={form.linkedinUrl} onChange={set("linkedinUrl")} required className="mt-2" /></div>
          <div className="col-span-2"><Label>GitHub *</Label><Input value={form.githubUrl} onChange={set("githubUrl")} required className="mt-2" /></div>
          <div className="col-span-2"><Label>Headline</Label><Input value={form.headline} onChange={set("headline")} className="mt-2" /></div>
          {error && <p className="col-span-2 neo-border bg-[var(--color-pink)] px-3 py-2 text-sm font-bold">{error}</p>}
          <Button type="submit" variant="lime" className="col-span-2 w-full" disabled={loading}>
            {loading ? "Creating..." : "Register →"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm font-bold">
          Have account? <Link href="/login" className="underline decoration-2">Login</Link>
        </p>
      </Card>
    </div>
  );
}
