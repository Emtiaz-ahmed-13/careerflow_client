"use client";

import { useCallback, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Copy, Mail, Send, Upload, Zap } from "lucide-react";
import { DashboardLayout, PageHeader } from "@/components/layout/sidebar";
import { GoalStreakCard } from "@/components/shared/goal-streak-card";
import { Button } from "@/components/ui/button";
import { Input, Label, Card, Textarea } from "@/components/ui/input";
import { JobPastePanel } from "@/components/shared/job-paste-panel";
import { JobPasteGuide, useExtensionJobImport } from "@/components/shared/job-paste-guide";
import { Tag } from "@/components/shared/tag";
import { api, uploadFile } from "@/lib/api/client";
import { toast } from "@/lib/toast";
import { copyToClipboard, openEmailComposer } from "@/lib/utils";
import type {
  CommitmentDays,
  DailyGoal,
  GoalSessionPreview,
  GoalSessionResult,
  ResumeDocument,
  ResumeTrack,
} from "@/types";
import { RESUME_TRACKS, RESUME_TRACK_LABELS } from "@/types";

type ResumeVault = {
  tracks: ResumeTrack[];
  resumes: Record<ResumeTrack, ResumeDocument | null>;
};

export default function GoalSessionPage() {
  const qc = useQueryClient();
  const [importingExtension, setImportingExtension] = useState(false);
  const [track, setTrack] = useState<ResumeTrack>("Backend");
  const [jobDescription, setJobDescription] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [recruiterEmail, setRecruiterEmail] = useState("");
  const [uploadingTrack, setUploadingTrack] = useState<ResumeTrack | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [savingCommitment, setSavingCommitment] = useState(false);
  const [preview, setPreview] = useState<GoalSessionPreview | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [result, setResult] = useState<GoalSessionResult | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetchingUrl, setFetchingUrl] = useState(false);

  const handleExtensionImport = useCallback((job: { url: string; description: string; title: string; company: string }) => {
    setJobUrl(job.url ?? "");
    setJobDescription(job.description ?? "");
    setFetchError(null);
    toast.success(`Imported: ${job.title} @ ${job.company}`);
  }, []);

  useExtensionJobImport(handleExtensionImport);

  useEffect(() => {
    if (preview) {
      document.getElementById("goal-session-preview")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [preview]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("import=extension")) {
      setImportingExtension(true);
      const t = setTimeout(() => setImportingExtension(false), 4000);
      return () => clearTimeout(t);
    }
  }, []);

  const { data: dailyGoal } = useQuery({
    queryKey: ["goals-today"],
    queryFn: () => api<DailyGoal>("/goals/today"),
  });

  const { data: vault, refetch: refetchVault } = useQuery({
    queryKey: ["resume-vault"],
    queryFn: () => api<ResumeVault>("/goals/resumes"),
  });

  const trackReady = Object.fromEntries(
    RESUME_TRACKS.map((t) => [t, !!vault?.resumes[t]]),
  ) as Record<ResumeTrack, boolean>;

  const uploadResume = async (resumeTrack: ResumeTrack, file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return toast.error("Only PDF files — export your resume as .pdf from Word or Google Docs");
    }
    if (file.size > 4 * 1024 * 1024) {
      return toast.error("PDF too large — max 4MB");
    }
    setUploadingTrack(resumeTrack);
    try {
      await uploadFile("/documents/upload", file, { type: "Resume", resumeTrack });
      await refetchVault();
      setTrack(resumeTrack);
      toast.success(`${RESUME_TRACK_LABELS[resumeTrack]} resume saved!`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploadingTrack(null);
    }
  };

  const setCommitment = async (commitmentDays: CommitmentDays) => {
    setSavingCommitment(true);
    try {
      await api("/goals/commitment", {
        method: "PATCH",
        body: JSON.stringify({ commitmentDays }),
      });
      await qc.invalidateQueries({ queryKey: ["goals-today"] });
      toast.success(`${commitmentDays}-day challenge started!`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update commitment");
    } finally {
      setSavingCommitment(false);
    }
  };

  const tryFetchUrl = async () => {
    if (!jobUrl.trim()) return toast.error("Paste a job URL first");
    setFetchingUrl(true);
    setFetchError(null);
    try {
      const data = await api<{ description: string }>("/ai/job/fetch", {
        method: "POST",
        body: JSON.stringify({ url: jobUrl }),
      });
      if (data.description.length >= 80) {
        setJobDescription(data.description);
        toast.success("Job text fetched — review & paste more if incomplete");
      } else {
        setFetchError("Not enough text from URL — paste the full LinkedIn job post below");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Fetch failed";
      setFetchError(msg);
      toast.warning("Paste the full job description manually");
    } finally {
      setFetchingUrl(false);
    }
  };

  const runPreview = async () => {
    if (!vault?.resumes[track]) {
      return toast.error(`Upload ${RESUME_TRACK_LABELS[track]} resume in vault first`);
    }
    if (!jobDescription.trim() && !jobUrl.trim()) {
      return toast.error("Paste job URL or description");
    }

    setPreviewing(true);
    setPreview(null);
    setResult(null);
    setFetchError(null);
    try {
      const data = await api<GoalSessionPreview>("/goals/session/preview", {
        method: "POST",
        body: JSON.stringify({
          resumeTrack: track,
          jobDescriptionText: jobDescription || undefined,
          jobUrl: jobUrl || undefined,
        }),
      });
      setPreview(data);
      setJobDescription(data.jobDescriptionText);
      if (data.jobUrl) setJobUrl(data.jobUrl);
      setTrack(data.resumeTrack);
      setCoverLetter(data.coverLetter?.content ?? "");
      setEmailSubject(data.email?.subject ?? "");
      setEmailContent(data.email?.content ?? "");
      if (data.parsed.recruiterEmail) setRecruiterEmail(data.parsed.recruiterEmail);
      if (data.lowMatch) {
        toast.warning(`Low match (${data.match.matchScore}%) — review before applying`);
      } else {
        toast.success(`Match ${data.match.matchScore}% — edit & confirm below`);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Preview failed";
      if (/linkedin|fetch|paste/i.test(msg) || (jobUrl.includes("linkedin") && jobDescription.length < 150)) {
        setFetchError("LinkedIn blocked auto-fetch or text too short");
      }
      toast.error(msg.includes("paste") ? msg : `${msg} — paste full job description below`);
    } finally {
      setPreviewing(false);
    }
  };

  const confirmSession = async (opts: { sendEmail?: boolean; skipApply?: boolean }) => {
    if (!preview) return;
    setConfirming(true);
    try {
      const data = await api<GoalSessionResult>("/goals/session/confirm", {
        method: "POST",
        body: JSON.stringify({
          resumeTrack: preview.resumeTrack,
          jobDescriptionText: preview.jobDescriptionText,
          companyName: preview.parsed.companyName,
          position: preview.parsed.position,
          jobUrl: preview.jobUrl ?? undefined,
          recruiterEmail: recruiterEmail || undefined,
          coverLetterContent: coverLetter,
          emailSubject,
          emailContent,
          matchScore: preview.match.matchScore,
          sendEmail: opts.sendEmail,
          skipApply: opts.skipApply,
        }),
      });
      setResult(data);
      if (data.skipped) {
        toast.info("Skipped — no application logged");
      } else if (data.emailSent) {
        toast.success(data.resumeAttached ? "Applied + email sent with resume!" : "Applied + email sent!");
      } else if (data.emailError) {
        toast.error(`Applied but email failed: ${data.emailError}`);
      } else if (opts.sendEmail && !recruiterEmail) {
        toast.warning("Applied — add recruiter email to send directly");
      } else {
        toast.success(`Applied: ${data.application?.position} @ ${data.application?.companyName}`);
      }
      if (!data.skipped) {
        qc.invalidateQueries({ queryKey: ["goals-today"] });
        qc.invalidateQueries({ queryKey: ["applications"] });
        qc.invalidateQueries({ queryKey: ["dashboard"] });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Confirm failed");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader title="Goal Session" subtitle="Your daily apply hub — paste job → AI match → letter → email → log" />

      {importingExtension && (
        <p className="neo-border mb-4 bg-[var(--color-cyan)] p-3 text-sm font-bold">
          Importing from Chrome extension...
        </p>
      )}

      <JobPasteGuide />

      {dailyGoal && (
        <div className="mb-8">
          <GoalStreakCard
            goal={dailyGoal}
            showCommitmentPicker
            savingCommitment={savingCommitment}
            onCommitmentChange={setCommitment}
          />
        </div>
      )}

      <section className="mb-8">
        <h2 className="neo-heading mb-4 text-sm">Resume Vault — upload once per type</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {RESUME_TRACKS.map((t) => {
            const doc = vault?.resumes[t];
            const active = track === t;
            return (
              <Card key={t} className={active ? "bg-[var(--color-lime)] ring-2 ring-black" : "bg-white"}>
                <p className="neo-heading text-xs">{RESUME_TRACK_LABELS[t]}</p>
                <p className="mt-2 text-xs font-medium">{doc ? `✓ ${doc.fileName}` : "No resume yet"}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant={active ? "white" : "lime"} size="sm" onClick={() => setTrack(t)} disabled={!doc}>
                    Use This
                  </Button>
                  <label className="neo-btn neo-btn-yellow cursor-pointer px-3 py-1.5 text-xs">
                    <Upload className="mr-1 inline h-3 w-3" />
                    {uploadingTrack === t ? "..." : doc ? "Replace" : "Upload"}
                    <input type="file" accept=".pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadResume(t, f); }} />
                  </label>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mb-8 max-w-3xl space-y-4">
        <JobPastePanel
          jobDescription={jobDescription}
          jobUrl={jobUrl}
          onJobDescriptionChange={(t) => { setJobDescription(t); setFetchError(null); }}
          onJobUrlChange={setJobUrl}
          hideResumeUpload
          extracting={previewing}
          track={track}
          onTrackChange={setTrack}
          trackReady={trackReady}
          suggestedTrack={preview?.suggestedTrack.track}
          suggestReason={preview?.suggestedTrack.reason}
          fetchError={fetchError}
          onTryFetchUrl={tryFetchUrl}
          fetchingUrl={fetchingUrl}
        />

        <Button variant="lime" className="w-full" onClick={runPreview} disabled={previewing || confirming}>
          <Zap className="h-4 w-4" />
          {previewing ? "AI analyzing..." : "Preview Session (match + letter + email)"}
        </Button>
      </section>

      {preview && !result && (
        <section id="goal-session-preview" className="space-y-4 border-t-[3px] border-black pt-8">
          <div>
            <h2 className="neo-heading text-lg">Step 2 — Edit cover letter &amp; email</h2>
            <p className="mt-1 text-sm font-medium text-neutral-600">Text box e click kore likha change koro, tarpor Confirm Apply</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className={`text-center ${preview.lowMatch ? "bg-[var(--color-pink)]" : "bg-[var(--color-cyan)]"}`}>
              <p className="text-xs font-black uppercase">Match Score</p>
              <p className="neo-heading text-5xl">{preview.match.matchScore}%</p>
              {preview.lowMatch && (
                <p className="mt-2 flex items-center justify-center gap-2 text-sm font-bold">
                  <AlertTriangle className="h-4 w-4" />
                  Below {preview.matchThreshold}% — consider skipping
                </p>
              )}
              <p className="mt-1 font-bold">{preview.parsed.position} @ {preview.parsed.companyName}</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {preview.match.strongSkills.slice(0, 4).map((s) => (
                  <Tag key={s} variant="lime">{s}</Tag>
                ))}
              </div>
            </Card>

            <Card className="bg-white">
              <Label>Recruiter Email</Label>
              <Input value={recruiterEmail} onChange={(e) => setRecruiterEmail(e.target.value)} className="mt-2 bg-white" placeholder="hr@company.com" type="email" />
              {preview.emailConfigured ? (
                <p className="mt-2 text-xs font-bold text-green-800">Direct email enabled — recruiter email dile Goal Session theke send hobe</p>
              ) : (
                <p className="mt-2 text-xs font-medium text-neutral-600">Recruiter email na thakle mail app diye manually pathate parbe</p>
              )}
            </Card>
          </div>

          <Card className="bg-white">
            <div className="mb-2 flex items-center justify-between">
              <Label>Cover Letter — edit before apply</Label>
              <Button variant="yellow" size="sm" onClick={() => { copyToClipboard(coverLetter); toast.success("Copied!"); }}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="min-h-[200px] bg-white text-sm"
              placeholder="AI cover letter will appear here — click and edit..."
            />
          </Card>

          <Card className="bg-white">
            <div className="mb-2 flex items-center justify-between">
              <Label>Email — edit before send</Label>
              <Button variant="yellow" size="sm" onClick={() => { copyToClipboard(`Subject: ${emailSubject}\n\n${emailContent}`); toast.success("Copied!"); }}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} className="mb-2 bg-white" placeholder="Subject" />
            <Textarea
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              className="min-h-[180px] bg-white text-sm"
              placeholder="AI email body will appear here — click and edit..."
            />
          </Card>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {preview.lowMatch && (
              <Button variant="pink" onClick={() => confirmSession({ skipApply: true })} disabled={confirming}>
                Skip Apply (low match)
              </Button>
            )}
            <Button variant="white" onClick={() => confirmSession({})} disabled={confirming}>
              {confirming ? "Saving..." : "Confirm Apply (log application)"}
            </Button>
            <Button
              variant="lime"
              onClick={() => {
                if (preview.emailConfigured) {
                  if (!recruiterEmail.trim()) {
                    toast.error("Recruiter email add koro — tarpor send korte parbe");
                    return;
                  }
                  confirmSession({ sendEmail: true });
                  return;
                }
                openEmailComposer({ to: recruiterEmail || undefined, subject: emailSubject, body: emailContent });
                confirmSession({});
                toast.info("Mail app khulche — application log hobe");
              }}
              disabled={confirming}
            >
              <Send className="h-4 w-4" />
              {confirming ? "Sending..." : preview.emailConfigured ? "Apply + Send Email" : "Apply + Open Email App"}
            </Button>
          </div>
        </section>
      )}

      {result && !result.skipped && result.application && (
        <section className="mt-8 space-y-4 border-t-[3px] border-black pt-8">
          <Card className="bg-[var(--color-lime)]">
            <p className="neo-heading text-xs">Logged as Applied</p>
            <p className="mt-1 font-bold">{result.application.position} @ {result.application.companyName}</p>
            {result.emailSent && (
              <p className="mt-1 text-sm font-bold">
                ✓ Email sent successfully{result.resumeAttached ? " with resume attached" : ""}
              </p>
            )}
            {result.emailError && <p className="mt-1 text-sm font-bold text-red-800">Email send failed — application saved. {result.emailError}</p>}
            <p className="mt-2 text-sm">{result.dailyGoal?.message}</p>
            <p className="mt-2 text-xs font-medium">Follow-up reminder set for 3 days</p>
          </Card>
        </section>
      )}
    </DashboardLayout>
  );
}
