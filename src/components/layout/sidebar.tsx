"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Briefcase, Columns3, FileSearch, Mail, MessageSquare,
  User, Settings, LogOut, Sparkles, Plus, UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/applications", label: "Applications", icon: Briefcase },
  { href: "/kanban", label: "Kanban Board", icon: Columns3 },
  { href: "/job-matcher", label: "Job Matcher", icon: Sparkles },
  { href: "/resume-analyzer", label: "Resume Analyzer", icon: FileSearch },
  { href: "/cover-letter", label: "Cover Letter", icon: Mail },
  { href: "/email-generator", label: "Email Generator", icon: MessageSquare },
  { href: "/interview-prep", label: "Interview Prep", icon: MessageSquare },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-[280px] flex-col border-r-[3px] border-black bg-[#f3f3f3]">
      {/* Logo */}
      <div className="border-b-[3px] border-black p-5">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="neo-heading text-xl">CareerFlow</span>
          <span className="neo-border neo-shadow-sm bg-[var(--color-yellow)] px-2 py-0.5 text-xs font-black uppercase">
            Tracker
          </span>
        </Link>
      </div>

      {/* User Identity Card */}
      {user && (
        <div className="p-4">
          <div className="neo-border neo-shadow bg-[var(--color-cyan)] p-4">
            <div className="flex items-start gap-3">
              <UserCircle className="h-8 w-8 shrink-0 stroke-[2.5]" />
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest">User Identity</p>
                <p className="truncate text-lg font-black uppercase leading-tight">
                  {user.firstName} {user.lastName}
                </p>
                <p className="truncate text-xs font-medium">{user.email}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Application CTA */}
      <div className="px-4 pb-4">
        <Link
          href="/applications"
          className="neo-btn neo-btn-lime flex w-full items-center justify-center gap-2 py-3 text-sm font-black"
        >
          <Plus className="h-5 w-5 stroke-[3]" />
          New Application
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 overflow-y-auto px-4 pb-4">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "neo-border flex items-center gap-3 px-3 py-2.5 text-sm font-bold uppercase transition",
                active
                  ? "neo-shadow-sm bg-[var(--color-lime)]"
                  : "bg-white hover:bg-neutral-100",
              )}
            >
              <Icon className="h-4 w-4 shrink-0 stroke-[2.5]" />
              <span className="flex-1 truncate">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={logout}
        className="neo-border mx-4 mb-4 flex items-center gap-3 bg-[var(--color-pink)] px-4 py-3 text-sm font-black uppercase neo-shadow-sm transition hover:translate-x-[1px] hover:translate-y-[1px]"
      >
        <LogOut className="h-4 w-4 stroke-[2.5]" />
        Logout
      </button>
    </aside>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f3f3f3] pl-[280px]">
      <Sidebar />
      <main className="min-h-screen p-6 md:p-8">{children}</main>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b-[3px] border-black pb-6">
      <div>
        <h1 className="neo-heading text-3xl md:text-4xl">{title}</h1>
        {subtitle && (
          <p className="mt-2 text-sm font-medium uppercase tracking-wide text-neutral-600">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}
