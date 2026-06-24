"use client";

import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Bell, Check } from "lucide-react";
import { DashboardLayout, PageHeader, useStreakAlert, useReminderAlert } from "@/components/layout/sidebar";
import { GoalStreakCard } from "@/components/shared/goal-streak-card";
import { Card } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/client";
import { toast } from "@/lib/toast";
import type { DashboardMetrics, DailyGoal, Reminder } from "@/types";

const COLORS = ["#a3e635", "#22d3ee", "#fde047", "#fb923c", "#fb7185", "#000"];

export default function DashboardPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api<DashboardMetrics>("/analytics/dashboard"),
  });

  const { data: dailyGoal } = useQuery({
    queryKey: ["goals-today"],
    queryFn: () => api<DailyGoal>("/goals/today"),
  });

  const { data: dueReminders = [] } = useQuery({
    queryKey: ["reminders-due"],
    queryFn: () => api<Reminder[]>("/reminders/due-today"),
  });

  const completeReminder = useMutation({
    mutationFn: (id: string) => api(`/reminders/${id}/complete`, { method: "PATCH" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reminders-due"] });
      toast.success("Follow-up marked done!");
    },
  });

  useStreakAlert(dailyGoal);
  useReminderAlert(dueReminders.length);

  const statusData = data ? Object.entries(data.byStatus).map(([name, value]) => ({ name, value })) : [];
  const rateData = data
    ? [
        { name: "Response", value: data.responseRate },
        { name: "Interview", value: data.interviewRate },
        { name: "Offer", value: data.offerRate },
      ]
    : [];
  const weeklyData = data?.weeklyApplies ?? [];

  const metrics = [
    { label: "Total Apps", value: data?.totalApplications ?? 0, bg: "bg-[var(--color-cyan)]" },
    { label: "Interviews", value: data?.interviews ?? 0, bg: "bg-[var(--color-lime)]" },
    { label: "Offers", value: data?.offers ?? 0, bg: "bg-[var(--color-yellow)]" },
    { label: "Rejections", value: data?.rejections ?? 0, bg: "bg-[var(--color-pink)]" },
  ];

  return (
    <DashboardLayout>
      <PageHeader title="Dashboard" subtitle="Your job search at a glance" />

      {dueReminders.length > 0 && (
        <Card className="mb-6 bg-[var(--color-yellow)]">
          <h2 className="neo-heading flex items-center gap-2 text-sm">
            <Bell className="h-4 w-4" /> Follow up today
          </h2>
          <ul className="mt-4 space-y-3">
            {dueReminders.map((r) => (
              <li key={r.id} className="neo-border flex flex-wrap items-center justify-between gap-3 bg-white p-3">
                <div>
                  <p className="font-black uppercase">
                    {r.application?.position ?? r.title} @ {r.application?.companyName ?? ""}
                  </p>
                  <p className="text-xs font-medium text-neutral-600">{r.title}</p>
                </div>
                <div className="flex gap-2">
                  {r.application?.id && (
                    <Link href={`/applications/${r.application.id}`}>
                      <Button variant="white" size="sm">View</Button>
                    </Link>
                  )}
                  <Button variant="lime" size="sm" onClick={() => completeReminder.mutate(r.id)}>
                    <Check className="h-4 w-4" /> Done
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {dailyGoal?.streakBroken && (
        <Card className="mb-6 bg-[var(--color-pink)]">
          <p className="neo-heading text-sm">Streak broken!</p>
          <p className="mt-1 font-bold">You missed a day. Apply today to restart your challenge.</p>
        </Card>
      )}

      {dailyGoal && (
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <GoalStreakCard goal={dailyGoal} />
          </div>
          <Link href="/goal-session" className="shrink-0">
            <Button variant="lime" className="w-full lg:w-auto">
              {dailyGoal.met ? "Apply Again →" : "Start Goal Session →"}
            </Button>
          </Link>
        </div>
      )}

      {isLoading ? (
        <p className="font-bold uppercase">Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {metrics.map((m) => (
              <Card key={m.label} className={m.bg}>
                <p className="text-xs font-black uppercase tracking-wide">{m.label}</p>
                <p className="neo-heading mt-2 text-4xl">{m.value}</p>
              </Card>
            ))}
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <h2 className="neo-heading mb-4 text-sm">Weekly Applies</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={weeklyData}>
                  <XAxis dataKey="week" tick={{ fontWeight: 700, fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontWeight: 700, fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#fde047" stroke="#000" strokeWidth={2} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card>
              <h2 className="neo-heading mb-4 text-sm">Success Rates (%)</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={rateData}>
                  <XAxis dataKey="name" tick={{ fontWeight: 700, fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontWeight: 700, fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#a3e635" stroke="#000" strokeWidth={2} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card>
              <h2 className="neo-heading mb-4 text-sm">By Status</h2>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} stroke="#000" strokeWidth={2}>
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
