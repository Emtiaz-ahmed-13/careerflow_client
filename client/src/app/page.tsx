"use client";

import Link from "next/link";
import {
  Zap,
  Target,
  Mail,
  FileText,
  KanbanSquare,
  MessageSquareText,
  Flame,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";

const FEATURES = [
  {
    icon: Target,
    title: "Paste & Match",
    desc: "Drop in any LinkedIn job — AI scores it against your resume instantly.",
    color: "bg-[var(--color-cyan)]",
  },
  {
    icon: FileText,
    title: "Cover Letters",
    desc: "Tailored cover letters written in your own style, every time.",
    color: "bg-[var(--color-lime)]",
  },
  {
    icon: Mail,
    title: "Smart Emails",
    desc: "Ready-to-send application emails with your links and contact info.",
    color: "bg-[var(--color-yellow)]",
  },
  {
    icon: KanbanSquare,
    title: "Kanban Tracker",
    desc: "Drag applications from Applied to Offer — never lose track again.",
    color: "bg-[var(--color-pink)]",
  },
  {
    icon: MessageSquareText,
    title: "Interview Prep",
    desc: "AI-generated questions tailored to the role you're chasing.",
    color: "bg-[var(--color-lime)]",
  },
  {
    icon: Flame,
    title: "Daily Streaks",
    desc: "7–90 day apply challenges that keep you consistent.",
    color: "bg-[var(--color-cyan)]",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Upload your resume once",
    desc: "Keep one resume per track — Backend, Frontend, or Software Engineer.",
  },
  {
    n: "02",
    title: "Paste a LinkedIn job",
    desc: "AI pulls the company and role, then picks the best resume to use.",
  },
  {
    n: "03",
    title: "Preview & edit",
    desc: "Get a match score, cover letter, and email — tweak them to taste.",
  },
  {
    n: "04",
    title: "Confirm & track",
    desc: "Logs the application, saves docs, and sets a 3-day follow-up reminder.",
  },
];

export default function LandingPage() {
  const { user, loading } = useAuth();
  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() || user.email : "";

  return (
    <div className="min-h-screen bg-[#f3f3f3]">
      {/* Navbar */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b-[3px] border-black bg-[#f3f3f3] px-6 py-4 md:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="neo-heading text-2xl">CareerFlow</span>
          <span className="neo-border neo-shadow-sm bg-[var(--color-yellow)] px-2 py-0.5 text-xs font-black uppercase">
            AI Tracker
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-9 w-24 animate-pulse neo-border bg-neutral-200" />
          ) : user ? (
            <Link href="/dashboard">
              <Button variant="lime" className="gap-2">
                <span className="flex h-6 w-6 items-center justify-center neo-border bg-white text-xs font-black uppercase">
                  {(user.firstName?.[0] ?? user.email[0]).toUpperCase()}
                </span>
                <span className="max-w-[140px] truncate">{displayName}</span>
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="white">Login</Button>
              </Link>
              <Link href="/register">
                <Button variant="lime">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 py-20 text-center md:px-8 md:py-28">
        <span className="neo-border neo-shadow-sm inline-block bg-[var(--color-pink)] px-3 py-1 text-xs font-black uppercase">
          Built for job-hunting engineers
        </span>
        <h1 className="neo-heading mt-6 text-5xl leading-tight md:text-7xl">
          Land your next job,
          <br />
          one apply at a time.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg font-medium text-neutral-700">
          Paste a LinkedIn job, get an instant AI match score, generate tailored cover
          letters & emails, and track every application on a Kanban board — all while
          keeping your daily streak alive.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          {user ? (
            <Link href="/dashboard">
              <Button size="lg" variant="lime" className="gap-2">
                Go to Dashboard <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/register">
                <Button size="lg" variant="lime" className="gap-2">
                  Start Free <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="yellow">
                  Login
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 pb-8 md:px-8">
        <h2 className="neo-heading mb-8 text-center text-3xl md:text-4xl">
          Everything you need to apply with confidence
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className={`neo-card p-6 ${f.color}`}>
                <span className="neo-border neo-shadow-sm inline-flex h-11 w-11 items-center justify-center bg-white">
                  <Icon className="h-5 w-5" strokeWidth={2.5} />
                </span>
                <h3 className="neo-heading mt-4 text-lg">{f.title}</h3>
                <p className="mt-2 text-sm font-medium">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-6 py-20 md:px-8">
        <h2 className="neo-heading mb-10 text-center text-3xl md:text-4xl">
          How it works
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.n} className="neo-card bg-white p-6">
              <span className="neo-heading text-3xl text-neutral-300">{s.n}</span>
              <h3 className="neo-heading mt-2 text-lg">{s.title}</h3>
              <p className="mt-2 text-sm font-medium text-neutral-700">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="mx-auto max-w-6xl px-6 pb-20 md:px-8">
        <div className="neo-card flex flex-col items-center gap-6 bg-[var(--color-lime)] p-10 text-center md:flex-row md:justify-between md:text-left">
          <div>
            <h2 className="neo-heading text-3xl md:text-4xl">
              <Zap className="mb-1 mr-1 inline h-7 w-7" strokeWidth={2.5} />
              Ready to build your apply streak?
            </h2>
            <p className="mt-2 text-base font-medium">
              Join CareerFlow and turn job hunting into a daily habit.
            </p>
          </div>
          {user ? (
            <Link href="/dashboard">
              <Button size="lg" variant="white" className="gap-2 whitespace-nowrap">
                Open Dashboard <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <Link href="/register">
              <Button size="lg" variant="white" className="gap-2 whitespace-nowrap">
                Get Started Free <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-[3px] border-black px-6 py-6 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-sm font-medium text-neutral-700 md:flex-row">
          <span className="neo-heading text-lg text-black">CareerFlow</span>
          <span>© {new Date().getFullYear()} CareerFlow — AI Job Application Tracker</span>
        </div>
      </footer>
    </div>
  );
}
