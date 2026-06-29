"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { Calendar, Pencil, Search, Trash2, XCircle, MailX } from "lucide-react";
import { DashboardLayout, PageHeader } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label, Card } from "@/components/ui/input";
import { JobPastePanel } from "@/components/shared/job-paste-panel";
import { StatusTag, Tag } from "@/components/shared/tag";
import { api } from "@/lib/api/client";
import { toast } from "@/lib/toast";
import type { ApplicationStatus, JobApplication } from "@/types";
import { STATUS_COLUMNS, STATUS_LABELS } from "@/types";
import { useTheme } from "@/providers/theme-provider";

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  Applied: "#fde047",
  Assessment: "#fb923c",
  Interview: "#a3e635",
  FinalInterview: "#22d3ee",
  Offer: "#86efac",
  Rejected: "#fb7185",
};

type RejectTarget = { id: string; companyName: string; position: string } | null;

export default function ApplicationsPage() {
  const { theme } = useTheme();
  const chartStroke = theme === "dark" ? "#f5f5f5" : "#0a0a0a";
  const chartTooltipStyle = {
    border: `3px solid ${chartStroke}`,
    background: theme === "dark" ? "#171717" : "#ffffff",
    color: theme === "dark" ? "#f5f5f5" : "#0a0a0a",
    fontWeight: 700 as const,
    fontSize: 12,
  };
  const axisTick = { fontSize: 10, fontWeight: 700 as const, fill: chartStroke };

  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "All">("All");
  const [rejectTarget, setRejectTarget] = useState<RejectTarget>(null);
  const [rejectionLetter, setRejectionLetter] = useState("");
  const [form, setForm] = useState({ companyName: "", position: "", jobUrl: "", salary: "", location: "", notes: "" });

  const { data: apps = [], isLoading } = useQuery({
    queryKey: ["applications"],
    queryFn: () => api<JobApplication[]>("/applications"),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return apps.filter((app) => {
      const matchesSearch =
        !q ||
        app.companyName.toLowerCase().includes(q) ||
        app.position.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "All" || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [apps, search, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of STATUS_COLUMNS) counts[s] = 0;
    for (const app of apps) counts[app.status] = (counts[app.status] ?? 0) + 1;
    return STATUS_COLUMNS.map((s) => ({
      status: s,
      label: STATUS_LABELS[s],
      count: counts[s] ?? 0,
      fill: STATUS_COLORS[s],
    }));
  }, [apps]);

  const pieData = statusCounts.filter((s) => s.count > 0);
  const total = apps.length;
  const rejectedCount = statusCounts.find((s) => s.status === "Rejected")?.count ?? 0;
  const appliedCount = statusCounts.find((s) => s.status === "Applied")?.count ?? 0;
  const interviewCount =
    (statusCounts.find((s) => s.status === "Interview")?.count ?? 0) +
    (statusCounts.find((s) => s.status === "FinalInterview")?.count ?? 0);
  const offerCount = statusCounts.find((s) => s.status === "Offer")?.count ?? 0;

  const create = useMutation({
    mutationFn: () => api("/applications", {
      method: "POST",
      body: JSON.stringify({ ...form, jobDescriptionText: jobDescription }),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applications"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setShowForm(false);
      setForm({ companyName: "", position: "", jobUrl: "", salary: "", location: "", notes: "" });
      setJobDescription("");
      toast.success("Application saved!");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to save"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api(`/applications/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applications"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Application deleted");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to delete"),
  });

  const markRejected = useMutation({
    mutationFn: ({ id, letter }: { id: string; letter: string }) =>
      api(`/applications/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: "Rejected",
          rejectionLetter: letter.trim() || undefined,
          rejectedAt: new Date().toISOString(),
        }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applications"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setRejectTarget(null);
      setRejectionLetter("");
      toast.success("Marked as rejected — letter saved");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to save rejection"),
  });

  const openRejectModal = (app: JobApplication) => {
    setRejectTarget({ id: app.id, companyName: app.companyName, position: app.position });
    setRejectionLetter(app.rejectionLetter ?? "");
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Applications"
        subtitle="Search, track status, and save rejection letters"
        action={
          <Button variant={showForm ? "pink" : "lime"} onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ New Application"}
          </Button>
        }
      />

      {/* Stats + charts */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Total", value: total, bg: "bg-[var(--color-cyan)]" },
          { label: "Applied", value: appliedCount, bg: "bg-[var(--color-yellow)]" },
          { label: "Interviews", value: interviewCount, bg: "bg-[var(--color-lime)]" },
          { label: "Rejected", value: rejectedCount, bg: "bg-[var(--color-pink)]" },
          { label: "Offers", value: offerCount, bg: "bg-[var(--color-lime)]" },
        ].map((m) => (
          <Card key={m.label} className={`${m.bg} text-center text-on-accent`}>
            <p className="text-xs font-black uppercase">{m.label}</p>
            <p className="neo-heading mt-1 text-3xl">{m.value}</p>
          </Card>
        ))}
      </div>

      {total > 0 && (
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <Card className="">
            <h2 className="neo-heading mb-4 text-sm">Status breakdown</h2>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={2}
                    stroke={chartStroke}
                    strokeWidth={2}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.status} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="">
            <h2 className="neo-heading mb-4 text-sm">Applications by status</h2>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusCounts} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="label"
                    tick={axisTick}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis allowDecimals={false} tick={axisTick} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} stroke={chartStroke} strokeWidth={2}>
                    {statusCounts.map((entry) => (
                      <Cell key={entry.status} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* Search + filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company or role..."
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter("All")}
            className={`neo-border neo-shadow-xs px-3 py-1 text-xs font-black uppercase ${
              statusFilter === "All" ? "chip-active" : "chip-inactive"
            }`}
          >
            All ({total})
          </button>
          {STATUS_COLUMNS.map((s) => {
            const count = statusCounts.find((c) => c.status === s)?.count ?? 0;
            if (count === 0 && statusFilter !== s) return null;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`neo-border neo-shadow-xs px-3 py-1 text-xs font-black uppercase ${
                  statusFilter === s ? "chip-active" : "chip-inactive"
                }`}
                style={statusFilter !== s ? { backgroundColor: STATUS_COLORS[s] } : undefined}
              >
                {STATUS_LABELS[s]} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {showForm && (
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <Card className="space-y-4 bg-surface">
            <h2 className="neo-heading text-sm">Application Details</h2>
            <div><Label>Company *</Label><Input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className="mt-2" /></div>
            <div><Label>Position *</Label><Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="mt-2" /></div>
            <div><Label>Job URL</Label><Input value={form.jobUrl} onChange={(e) => setForm({ ...form, jobUrl: e.target.value })} className="mt-2" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Salary</Label><Input value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} className="mt-2" /></div>
              <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="mt-2" /></div>
            </div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-2" /></div>
            <Button variant="lime" onClick={() => create.mutate()} disabled={!form.companyName || !form.position || create.isPending}>
              Save Application
            </Button>
          </Card>
          <JobPastePanel jobDescription={jobDescription} onJobDescriptionChange={setJobDescription} />
        </div>
      )}

      {isLoading && <p className="font-bold uppercase">Loading...</p>}

      {!isLoading && filtered.length === 0 && (
        <Card className="mb-4 bg-[var(--color-yellow)] text-center">
          <p className="font-black uppercase">
            {apps.length === 0
              ? "No applications yet — use Goal Session or + New Application!"
              : "No matches — try a different search or filter."}
          </p>
        </Card>
      )}

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((app) => {
          const hasEmail = !!app.applicationEmails?.[0];
          const matchScore = app.resumeAnalyses?.[0]?.matchScore;
          const isRejected = app.status === "Rejected";

          return (
            <Card
              key={app.id}
              className={`flex flex-col ${isRejected ? "bg-[var(--color-pink)]/30 ring-2 ring-[var(--color-pink)]" : "chip-inactive"}`}
            >
              <Link href={`/applications/${app.id}`} className="group">
                <h3 className="neo-heading text-base leading-snug group-hover:underline">{app.position}</h3>
              </Link>
              <p className="mt-1 flex items-center gap-1 text-xs font-bold uppercase text-muted">
                <Calendar className="h-3.5 w-3.5" />
                Applied {new Date(app.createdAt).toLocaleDateString()}
                {app.rejectedAt && (
                  <span className="ml-1 text-[var(--color-pink)]">
                    · Rejected {new Date(app.rejectedAt).toLocaleDateString()}
                  </span>
                )}
              </p>
              <p className="mt-3 line-clamp-2 text-sm font-medium">
                {isRejected && app.rejectionLetter
                  ? app.rejectionLetter.slice(0, 120) + "..."
                  : app.notes || app.jobDescriptionText?.slice(0, 100) || "No description yet."}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Tag variant="orange">{app.companyName}</Tag>
                <StatusTag status={STATUS_LABELS[app.status]} />
                {matchScore != null && <Tag variant="yellow">{matchScore}% match</Tag>}
                {hasEmail && <Tag variant="yellow">Email</Tag>}
                {app.rejectionLetter && (
                  <Tag variant="pink">
                    <MailX className="mr-0.5 inline h-3 w-3" /> Letter saved
                  </Tag>
                )}
              </div>
              <div className="mt-auto flex flex-wrap gap-2 pt-5">
                <Link href={`/applications/${app.id}`} className="flex-1">
                  <Button variant="lime" size="sm" className="w-full">Open</Button>
                </Link>
                {app.status !== "Rejected" && (
                  <Button variant="pink" size="sm" onClick={() => openRejectModal(app)} title="Mark as rejected">
                    <XCircle className="h-4 w-4" />
                  </Button>
                )}
                <Link href={`/applications/${app.id}?edit=1`}>
                  <Button variant="yellow" size="sm"><Pencil className="h-4 w-4" /></Button>
                </Link>
                <Button variant="pink" size="sm" onClick={() => remove.mutate(app.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Rejection modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-surface">
            <h2 className="neo-heading text-lg">Mark as Rejected</h2>
            <p className="mt-1 text-sm font-medium text-muted">
              {rejectTarget.position} @ {rejectTarget.companyName}
            </p>
            <p className="mt-3 text-xs font-bold uppercase text-[var(--color-muted)]">
              Paste the rejection email you received — it will be saved on this application.
            </p>
            <Textarea
              value={rejectionLetter}
              onChange={(e) => setRejectionLetter(e.target.value)}
              placeholder="Dear Applicant,&#10;&#10;Thank you for applying..."
              className="mt-3 min-h-[280px] font-mono text-sm"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="pink"
                onClick={() => markRejected.mutate({ id: rejectTarget.id, letter: rejectionLetter })}
                disabled={markRejected.isPending}
              >
                <XCircle className="h-4 w-4" />
                Save as Rejected
              </Button>
              <Button variant="white" onClick={() => { setRejectTarget(null); setRejectionLetter(""); }}>
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}