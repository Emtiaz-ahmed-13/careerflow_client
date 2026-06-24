import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f3f3f3]">
      <header className="flex items-center justify-between border-b-[3px] border-black px-8 py-5">
        <div className="flex items-center gap-2">
          <span className="neo-heading text-2xl">CareerFlow</span>
          <span className="neo-border neo-shadow-sm bg-[var(--color-yellow)] px-2 py-0.5 text-xs font-black uppercase">
            AI Tracker
          </span>
        </div>
        <div className="flex gap-3">
          <Link href="/login"><Button variant="white">Login</Button></Link>
          <Link href="/register"><Button variant="lime">Get Started</Button></Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-8 py-20 text-center">
        <h1 className="neo-heading text-5xl leading-tight md:text-6xl">
          AI-Powered Job<br />Application Tracker
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg font-medium text-neutral-700">
          Paste LinkedIn jobs, get AI match scores, generate emails & cover letters, track applications on Kanban.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/register"><Button size="lg" variant="lime">Start Free →</Button></Link>
          <Link href="/login"><Button size="lg" variant="yellow">Login</Button></Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 px-8 pb-20 md:grid-cols-3">
        {[
          { title: "Paste & Match", desc: "Copy LinkedIn job posts — AI compares with your resume instantly.", color: "bg-[var(--color-cyan)]" },
          { title: "Smart Emails", desc: "Generate professional emails with LinkedIn, GitHub & contact info.", color: "bg-[var(--color-lime)]" },
          { title: "Kanban Tracker", desc: "Drag applications from Applied to Offer — never lose track.", color: "bg-[var(--color-yellow)]" },
        ].map((f) => (
          <div key={f.title} className={`neo-card p-6 ${f.color}`}>
            <h3 className="neo-heading text-lg">{f.title}</h3>
            <p className="mt-3 text-sm font-medium">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
