"use client";

import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { DashboardLayout, PageHeader } from "@/components/layout/sidebar";
import { Card } from "@/components/ui/input";
import { api } from "@/lib/api/client";
import type { DashboardMetrics } from "@/types";

const COLORS = ["#a3e635", "#22d3ee", "#fde047", "#fb923c", "#fb7185", "#000"];

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api<DashboardMetrics>("/analytics/dashboard"),
  });

  const statusData = data ? Object.entries(data.byStatus).map(([name, value]) => ({ name, value })) : [];
  const rateData = data
    ? [
        { name: "Response", value: data.responseRate },
        { name: "Interview", value: data.interviewRate },
        { name: "Offer", value: data.offerRate },
      ]
    : [];

  const metrics = [
    { label: "Total Apps", value: data?.totalApplications ?? 0, bg: "bg-[var(--color-cyan)]" },
    { label: "Interviews", value: data?.interviews ?? 0, bg: "bg-[var(--color-lime)]" },
    { label: "Offers", value: data?.offers ?? 0, bg: "bg-[var(--color-yellow)]" },
    { label: "Rejections", value: data?.rejections ?? 0, bg: "bg-[var(--color-pink)]" },
  ];

  return (
    <DashboardLayout>
      <PageHeader title="Dashboard" subtitle="Your job search at a glance" />

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

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Card>
              <h2 className="neo-heading mb-4 text-sm">Success Rates (%)</h2>
              <ResponsiveContainer width="100%" height={250}>
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
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} stroke="#000" strokeWidth={2}>
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
