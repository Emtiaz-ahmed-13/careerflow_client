"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, Calendar, Copy, FileText, Mail, Trash2, Pencil, Check, Clock,
} from "lucide-react";
import { DashboardLayout, PageHeader } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label, Card } from "@/components/ui/input";
import { StatusTag, Tag } from "@/components/shared/tag";
import { api } from "@/lib/api/client";
import { toast } from "@/lib/toast";
import { copyToClipboard } from "@/lib/utils";
import type { ApplicationStatus, JobApplication } from "@/types";
import { STATUS_LABELS } from "@/types";

const STATUSES: ApplicationStatus[] = ["Applied", "Assessment", "Interview", "FinalInterview", "Offer", "Rejected"];

function ApplicationDetailContent() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(searchParams.get("edit") === "1");
  const [form, setForm] = useState({
    companyName: "",
    position: "",
    jobUrl: "",
    salary: "",
    location: "",
    notes: "",
    jobDescriptionText: "",
    status: "Applied" as ApplicationStatus,
    coverLetterContent: "",
    emailSubject: "",
    emailContent: "",
  });

  const { data: app, isLoading } = useQuery({
    queryKey: ["application", id],
    queryFn: () => api<JobApplication>(`/applications/${id}`),
  });

  useEffect(() => {
    if (app) {
      setForm({
        companyName: app.companyName,
        position: app.position,
        jobUrl: app.jobUrl ?? "",
        salary: app.salary ?? "",
        location: app.location ?? "",
        notes: app.notes ?? "",
        jobDescriptionText: app.jobDescriptionText ?? "",
        status: app.status,
        coverLetterContent: app.coverLetters?.[0]?.content ?? "",
        emailSubject: app.applicationEmails?.[0]?.subject ?? "",
        emailContent: app.applicationEmails?.[0]?.content ?? "",
      });
    }
  }, [app]);

  const save = useMutation({
    mutationFn: () =>
      api(`/applications/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          companyName: form.companyName,
          position: form.position,
          jobUrl: form.jobUrl || undefined,
          salary: form.salary || undefined,
          location: form.location || undefined,
          notes: form.notes || undefined,
          jobDescriptionText: form.jobDescriptionText || undefined,
          status: form.status,
          coverLetterContent: form.coverLetterContent || undefined,
          emailSubject: form.emailSubject || undefined,
          emailContent: form.emailContent || undefined,
        }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["application", id] });
      qc.invalidateQueries({ queryKey: ["applications"] });
      setEditing(false);
      toast.success("Application updated!");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
  });

  const remove = useMutation({
    mutationFn: () => api(`/applications/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applications"] });
      toast.success("Deleted");
      router.push("/applications");
    },
  });

  if (isLoading || !app) {
    return (
      <DashboardLayout>
        <p className="font-bold uppercase">Loading...</p>
      </DashboardLayout>
    );
  }

  const letter = app.coverLetters?.[0];
  const email = app.applicationEmails?.[0];
  const match = app.resumeAnalyses?.[0];

  const timeline: { date: string; label: string; detail: string }[] = [
    { date: app.createdAt, label: "Applied", detail: `${app.position} @ ${app.companyName}` },
    ...(letter?.createdAt ? [{ date: letter.createdAt, label: "Cover letter saved", detail: "From Goal Session" }] : []),
    ...(email?.createdAt ? [{ date: email.createdAt, label: "Email saved", detail: email.subject }] : []),
    ...(match?.createdAt ? [{ date: match.createdAt, label: "Match analyzed", detail: `${match.matchScore}% match` }] : []),
    ...(app.reminders?.map((r) => ({
      date: r.remindAt,
      label: r.isCompleted ? "Follow-up done" : "Follow-up scheduled",
      detail: r.title,
    })) ?? []),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Link href="/applications" className="neo-heading inline-flex items-center gap-2 text-sm hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Applications
        </Link>
      </div>

      <PageHeader
        title={app.position}
        subtitle={app.companyName}
        action={
          <div className="flex flex-wrap gap-2">
            {editing ? (
              <>
                <Button variant="white" onClick={() => setEditing(false)}>Cancel</Button>
                <Button variant="lime" onClick={() => save.mutate()} disabled={save.isPending}>
                  <Check className="h-4 w-4" /> Save
                </Button>
              </>
            ) : (
              <>
                <Button variant="yellow" onClick={() => setEditing(true)}>
                  <Pencil className="h-4 w-4" /> Edit
                </Button>
                <Button variant="pink" onClick={() => remove.mutate()} disabled={remove.isPending}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <StatusTag status={STATUS_LABELS[app.status]} />
        {match?.matchScore != null && <Tag variant="yellow">{match.matchScore}% match</Tag>}
        <Tag variant="orange">
          <Calendar className="mr-1 inline h-3 w-3" />
          {new Date(app.createdAt).toLocaleDateString()}
        </Tag>
      </div>

      {editing ? (
        <Card className="mb-8 space-y-4 bg-[var(--color-yellow)]">
          <h2 className="neo-heading text-sm">Edit Application</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>Company *</Label><Input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className="mt-2 bg-white" /></div>
            <div><Label>Position *</Label><Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="mt-2 bg-white" /></div>
            <div><Label>Status</Label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ApplicationStatus })} className="neo-border mt-2 w-full bg-white p-2 text-sm font-bold">
                {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
            <div><Label>Job URL</Label><Input value={form.jobUrl} onChange={(e) => setForm({ ...form, jobUrl: e.target.value })} className="mt-2 bg-white" /></div>
            <div><Label>Salary</Label><Input value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} className="mt-2 bg-white" /></div>
            <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="mt-2 bg-white" /></div>
          </div>
          <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-2 bg-white" /></div>
          <div><Label>Job Description</Label><Textarea value={form.jobDescriptionText} onChange={(e) => setForm({ ...form, jobDescriptionText: e.target.value })} className="mt-2 min-h-[160px] bg-white font-mono text-sm" /></div>
          {letter && (
            <div>
              <Label>Cover Letter</Label>
              <Textarea
                value={form.coverLetterContent}
                onChange={(e) => setForm({ ...form, coverLetterContent: e.target.value })}
                className="mt-2 min-h-[200px] bg-white text-sm"
              />
            </div>
          )}
          {email && (
            <div className="space-y-3">
              <div>
                <Label>Email Subject</Label>
                <Input value={form.emailSubject} onChange={(e) => setForm({ ...form, emailSubject: e.target.value })} className="mt-2 bg-white" />
              </div>
              <div>
                <Label>Email Body</Label>
                <Textarea
                  value={form.emailContent}
                  onChange={(e) => setForm({ ...form, emailContent: e.target.value })}
                  className="mt-2 min-h-[160px] bg-white text-sm"
                />
              </div>
            </div>
          )}
        </Card>
      ) : (
        app.jobDescriptionText && (
          <Card className="mb-8 bg-white">
            <h2 className="neo-heading text-sm">Job Description</h2>
            <div className="neo-border mt-3 max-h-48 overflow-y-auto bg-[#f3f3f3] p-4 text-sm whitespace-pre-wrap">{app.jobDescriptionText}</div>
          </Card>
        )
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {letter && (
          <Card className="bg-white">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="neo-heading flex items-center gap-2 text-sm"><FileText className="h-4 w-4" /> Cover Letter</h2>
              <div className="flex gap-2">
                <Button variant="yellow" size="sm" onClick={() => setEditing(true)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="yellow" size="sm" onClick={() => { copyToClipboard(letter.content); toast.success("Copied!"); }}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="neo-border max-h-64 overflow-y-auto bg-white p-4 text-sm whitespace-pre-wrap">{letter.content}</div>
            <p className="mt-2 text-xs font-medium text-neutral-600">Edit korar jonno pencil icon ba top-right Edit click koro</p>
          </Card>
        )}

        {email && (
          <Card className="bg-white">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="neo-heading flex items-center gap-2 text-sm"><Mail className="h-4 w-4" /> Application Email</h2>
              <div className="flex gap-2">
                <Button variant="yellow" size="sm" onClick={() => setEditing(true)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="yellow" size="sm" onClick={() => { copyToClipboard(`Subject: ${email.subject}\n\n${email.content}`); toast.success("Copied!"); }}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs font-bold">Subject: {email.subject}</p>
            <div className="neo-border mt-2 max-h-56 overflow-y-auto bg-white p-4 text-sm whitespace-pre-wrap">{email.content}</div>
          </Card>
        )}

        {match && (
          <Card className="bg-[var(--color-cyan)]">
            <h2 className="neo-heading text-sm">Match Analysis</h2>
            <p className="neo-heading mt-2 text-4xl">{match.matchScore}%</p>
            {match.strongSkills && match.strongSkills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {match.strongSkills.slice(0, 6).map((s) => <Tag key={s} variant="lime">{s}</Tag>)}
              </div>
            )}
          </Card>
        )}

        <Card className="bg-[var(--color-lime)] lg:col-span-2">
          <h2 className="neo-heading flex items-center gap-2 text-sm"><Clock className="h-4 w-4" /> Timeline</h2>
          <ul className="mt-4 space-y-3">
            {timeline.map((item, i) => (
              <li key={i} className="neo-border flex gap-4 bg-white p-3">
                <span className="shrink-0 text-xs font-black uppercase text-neutral-500">
                  {new Date(item.date).toLocaleDateString()}
                </span>
                <div>
                  <p className="font-black uppercase text-sm">{item.label}</p>
                  <p className="text-sm font-medium">{item.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default function ApplicationDetailPage() {
  return (
    <Suspense fallback={<DashboardLayout><p className="font-bold">Loading...</p></DashboardLayout>}>
      <ApplicationDetailContent />
    </Suspense>
  );
}
