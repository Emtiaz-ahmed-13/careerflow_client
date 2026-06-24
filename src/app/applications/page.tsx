"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Pencil, Trash2 } from "lucide-react";
import { DashboardLayout, PageHeader } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label, Card } from "@/components/ui/input";
import { JobPastePanel } from "@/components/shared/job-paste-panel";
import { StatusTag, Tag } from "@/components/shared/tag";
import { api } from "@/lib/api/client";
import { toast } from "@/lib/toast";
import type { JobApplication } from "@/types";
import { STATUS_LABELS } from "@/types";

export default function ApplicationsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [form, setForm] = useState({ companyName: "", position: "", jobUrl: "", salary: "", location: "", notes: "" });

  const { data: apps = [], isLoading } = useQuery({
    queryKey: ["applications"],
    queryFn: () => api<JobApplication[]>("/applications"),
  });

  const create = useMutation({
    mutationFn: () => api("/applications", {
      method: "POST",
      body: JSON.stringify({ ...form, jobDescriptionText: jobDescription }),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applications"] });
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
      toast.success("Application deleted");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to delete"),
  });

  return (
    <DashboardLayout>
      <PageHeader
        title="Applications"
        subtitle="Track every job — open any apply for letter, email & timeline"
        action={
          <Button variant={showForm ? "pink" : "lime"} onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ New Application"}
          </Button>
        }
      />

      {showForm && (
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <Card className="space-y-4 bg-white">
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

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {apps.map((app) => {
          const hasLetter = !!app.coverLetters?.[0];
          const hasEmail = !!app.applicationEmails?.[0];
          const matchScore = app.resumeAnalyses?.[0]?.matchScore;

          return (
            <Card key={app.id} className="flex flex-col bg-white">
              <Link href={`/applications/${app.id}`} className="group">
                <h3 className="neo-heading text-base leading-snug group-hover:underline">{app.position}</h3>
              </Link>
              <p className="mt-1 flex items-center gap-1 text-xs font-bold uppercase text-neutral-600">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(app.createdAt).toLocaleDateString()}
              </p>
              <p className="mt-3 line-clamp-2 text-sm font-medium">
                {app.notes || app.jobDescriptionText?.slice(0, 100) || "No description yet."}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Tag variant="orange">{app.companyName}</Tag>
                <StatusTag status={STATUS_LABELS[app.status]} />
                {matchScore != null && <Tag variant="yellow">{matchScore}% match</Tag>}
                {hasLetter && <Tag variant="lime">Letter</Tag>}
                {hasEmail && <Tag variant="yellow">Email</Tag>}
              </div>
              <div className="mt-auto flex flex-wrap gap-2 pt-5">
                <Link href={`/applications/${app.id}`} className="flex-1">
                  <Button variant="lime" size="sm" className="w-full">Open</Button>
                </Link>
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

      {!isLoading && apps.length === 0 && (
        <Card className="mt-4 bg-[var(--color-yellow)] text-center">
          <p className="font-black uppercase">No applications yet — use Goal Session or + New Application!</p>
        </Card>
      )}
    </DashboardLayout>
  );
}
