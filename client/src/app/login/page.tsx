"use client";

import { useState } from "react";
import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useTheme } from "@/providers/theme-provider";
import { Button } from "@/components/ui/button";
import { Input, Label, Card } from "@/components/ui/input";

export default function LoginPage() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-app p-4">
      <Button
        variant="white"
        size="sm"
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="absolute right-4 top-4"
      >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
      <Card className="w-full max-w-md bg-[var(--color-cyan)]">
        <div className="mb-2 flex items-center gap-2">
          <span className="neo-heading text-2xl">Login</span>
          <span className="neo-border bg-[var(--color-yellow)] px-2 py-0.5 text-[10px] font-black uppercase">CareerFlow</span>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-2" />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-2" />
          </div>
          {error && <p className="neo-border bg-[var(--color-pink)] px-3 py-2 text-sm font-bold">{error}</p>}
          <Button type="submit" variant="lime" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login →"}
          </Button>
        </form>
        <p className="mt-5 text-center text-sm font-bold">
          No account?{" "}
          <Link href="/register" className="underline decoration-2 underline-offset-4">Register</Link>
        </p>
      </Card>
    </div>
  );
}