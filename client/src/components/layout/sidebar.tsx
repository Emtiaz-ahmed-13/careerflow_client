"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard, Briefcase, Columns3, MessageSquare,
  User, Settings, LogOut, Sparkles, Plus, UserCircle, Flame, Menu, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { api } from "@/lib/api/client";
import { toast } from "@/lib/toast";
import type { DailyGoal } from "@/types";

const primaryNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/goal-session", label: "Goal Session", icon: Sparkles },
  { href: "/applications", label: "Applications", icon: Briefcase },
  { href: "/kanban", label: "Kanban Board", icon: Columns3 },
];

const toolsNav = [
  { href: "/interview-prep", label: "Interview Prep", icon: MessageSquare },
];

const accountNav = [
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

function SidebarContent({
  pathname,
  user,
  dailyGoal,
  onNavigate,
  onLogout,
}: {
  pathname: string;
  user: { firstName: string; lastName: string; email: string } | null;
  dailyGoal?: DailyGoal;
  onNavigate?: () => void;
  onLogout: () => void;
}) {
  const renderLink = (href: string, label: string, Icon: typeof LayoutDashboard) => {
    const active = pathname === href;
    return (
      <Link
        key={href}
        href={href}
        onClick={onNavigate}
        className={cn(
          "neo-border flex items-center gap-3 px-3 py-2.5 text-sm font-bold uppercase transition",
          active ? "neo-shadow-sm bg-[var(--color-lime)]" : "bg-white hover:bg-neutral-100",
        )}
      >
        <Icon className="h-4 w-4 shrink-0 stroke-[2.5]" />
        <span className="flex-1 truncate">{label}</span>
      </Link>
    );
  };

  return (
    <>
      <div className="border-b-[3px] border-black p-5">
        <Link href="/dashboard" className="flex items-center gap-2" onClick={onNavigate}>
          <span className="neo-heading text-xl">CareerFlow</span>
          <span className="neo-border neo-shadow-sm bg-[var(--color-yellow)] px-2 py-0.5 text-xs font-black uppercase">Tracker</span>
        </Link>
      </div>

      {user && (
        <div className="p-4">
          <div className="neo-border neo-shadow bg-[var(--color-cyan)] p-4">
            <div className="flex items-start gap-3">
              <UserCircle className="h-8 w-8 shrink-0 stroke-[2.5]" />
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest">User Identity</p>
                <p className="truncate text-lg font-black uppercase leading-tight">{user.firstName} {user.lastName}</p>
                <p className="truncate text-xs font-medium">{user.email}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 pb-4">
        <Link href="/goal-session" className="neo-btn neo-btn-lime flex w-full flex-col items-center justify-center gap-1 py-3 text-sm font-black" onClick={onNavigate}>
          <span className="flex items-center gap-2">
            <Plus className="h-5 w-5 stroke-[3]" />
            Daily Apply
          </span>
          {dailyGoal && (
            <span className="flex items-center gap-2 text-[10px] font-black uppercase">
              <Flame className="h-3 w-3" />
              {dailyGoal.streak} streak · Day {dailyGoal.commitmentDay}/{dailyGoal.commitmentDays}
            </span>
          )}
        </Link>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
        <div className="space-y-2">
          {primaryNav.map(({ href, label, icon }) => renderLink(href, label, icon))}
        </div>
        <div>
          <p className="mb-2 px-1 text-[10px] font-black uppercase tracking-widest text-neutral-500">More</p>
          <div className="space-y-2">
            {toolsNav.map(({ href, label, icon }) => renderLink(href, label, icon))}
            {accountNav.map(({ href, label, icon }) => renderLink(href, label, icon))}
          </div>
        </div>
      </nav>

      <button
        onClick={onLogout}
        className="neo-border mx-4 mb-4 flex items-center gap-3 bg-[var(--color-pink)] px-4 py-3 text-sm font-black uppercase neo-shadow-sm transition hover:translate-x-[1px] hover:translate-y-[1px]"
      >
        <LogOut className="h-4 w-4 stroke-[2.5]" />
        Logout
      </button>
    </>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: dailyGoal } = useQuery({
    queryKey: ["goals-today"],
    queryFn: () => api<DailyGoal>("/goals/today"),
    enabled: !!user,
  });

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        className="neo-border fixed left-4 top-4 z-50 bg-[var(--color-lime)] p-2 md:hidden"
        onClick={() => setMobileOpen((o) => !o)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu overlay"
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen w-[280px] flex-col border-r-[3px] border-black bg-[#f3f3f3] transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <SidebarContent
          pathname={pathname}
          user={user}
          dailyGoal={dailyGoal}
          onNavigate={() => setMobileOpen(false)}
          onLogout={logout}
        />
      </aside>
    </>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f3f3f3] md:pl-[280px]">
      <Sidebar />
      <main className="min-h-screen p-4 pt-16 md:p-8 md:pt-8">{children}</main>
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

export function useStreakAlert(dailyGoal?: DailyGoal) {
  useEffect(() => {
    if (dailyGoal?.streakBroken) {
      toast.warning("Your streak broke! Apply today in Goal Session to restart.", { duration: 8000 });
    }
  }, [dailyGoal?.streakBroken]);
}

export function useReminderAlert(count: number) {
  useEffect(() => {
    if (count > 0) {
      toast.info(
        count === 1 ? "You have 1 follow-up due today" : `You have ${count} follow-ups due today`,
      );
    }
  }, [count]);
}
