"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Check, Sparkles, Upload, Zap } from "lucide-react";
import { DashboardLayout } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/input";
import { Tag } from "@/components/shared/tag";
import { api, uploadFile } from "@/lib/api/client";
import { SAMPLE_JOB_DESCRIPTION } from "@/lib/sample-job";
import { toast } from "@/lib/toast";
import { useAuth } from "@/providers/auth-provider";
import type { CommitmentDays, GoalSessionPreview, ResumeDocument, ResumeTrack } from "@/types";
import { COMMITMENT_OPTIONS, RESUME_TRACKS, RESUME_TRACK_LABELS } from "@/types";

type ResumeVault = {
  tracks: ResumeTrack[];
  resumes: Record<ResumeTrack, ResumeDocument | null>;
};

type OnboardingProgress = {
  step: number;
  commitmentDays: CommitmentDays;
  track: ResumeTrack;
  hasPreview: boolean;
};

const STEPS = ["Challenge", "Resume", "AI Preview"] as const;
const PROGRESS_KEY = "careerflow_onboarding_progress";

function loadProgress(): Partial<OnboardingProgress> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveProgress(data: OnboardingProgress) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
}

function clearProgress() {
  localStorage.removeItem(PROGRESS_KEY);
}

export default function OnboardingPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { user, refreshOnboarding } = useAuth();
  const saved = loadProgress();
  const [step, setStep] = useState(saved.step ?? 0);
  const [track, setTrack] = useState<ResumeTrack>(saved.track ?? "Backend");
  const [commitmentDays, setCommitmentDays] = useState<CommitmentDays>(saved.commitmentDays ?? 30);
  const [uploading, setUploading] = useState(false);
  const [savingCommitment, setSavingCommitment] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [preview, setPreview] = useState<GoalSessionPreview | null>(null);
  const [finishing, setFinishing] = useState(false);
  const [skipping, setSkipping] = useState(false);

  const { data: vault, refetch: refetchVault } = useQuery({
    queryKey: ["resume-vault"],
    queryFn: () => api<ResumeVault>("/goals/resumes"),
  });

  const hasResume = RESUME_TRACKS.some((t) => !!vault?.resumes[t]);

  useEffect(() => {
    if (hasResume && step < 2) setStep(2);
  }, [hasResume, step]);

  useEffect(() => {
    saveProgress({ step, commitmentDays, track, hasPreview: !!preview });
  }, [step, commitmentDays, track, preview]);

  const markDone = async () => {
    localStorage.setItem("careerflow_onboarding_done", "1");
    clearProgress();
    await refreshOnboarding();
  };

  const skipSetup = async () => {
    setSkipping(true);
    try {
      await api("/goals/onboarding/skip", { method: "POST" });
      await markDone();
      toast.info("Skipped setup — upload resume anytime in Goal Session");
      router.push("/goal-session");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not skip");
    } finally {
      setSkipping(false);
    }
  };

  const saveCommitment = async () => {
    setSavingCommitment(true);
    try {
      await api("/goals/commitment", {
        method: "PATCH",
        body: JSON.stringify({ commitmentDays }),
      });
      await qc.invalidateQueries({ queryKey: ["goals-today"] });
      setStep(1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save challenge");
    } finally {
      setSavingCommitment(false);
    }
  };

  const uploadResume = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return toast.error("Only PDF files — export as .pdf from Word or Google Docs");
    }
    if (file.size > 4 * 1024 * 1024) {
      return toast.error("PDF too large — max 4MB");
    }
    setUploading(true);
    try {
      await uploadFile("/documents/upload", file, { type: "Resume", resumeTrack: track });
      await refetchVault();
      toast.success("Resume saved!");
      setStep(2);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const runSamplePreview = async () => {
    const resumeTrack = RESUME_TRACKS.find((t) => vault?.resumes[t]) ?? track;
    if (!vault?.resumes[resumeTrack]) {
      return toast.error("Upload your resume first");
    }
    setPreviewing(true);
    try {
      const data = await api<GoalSessionPreview>("/goals/session/preview", {
        method: "POST",
        body: JSON.stringify({
          resumeTrack,
          jobDescriptionText: SAMPLE_JOB_DESCRIPTION,
        }),
      });
      setPreview(data);
      toast.success(`AI match: ${data.match.matchScore}% — this is what every apply feels like`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Preview failed");
    } finally {
      setPreviewing(false);
    }
  };

  const finish = async () => {
    setFinishing(true);
    try {
      await api("/goals/onboarding/complete", { method: "POST" });
      await markDone();
      toast.success("You're ready — start your daily apply!");
      router.push("/goal-session");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not finish setup");
    } finally {
      setFinishing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex justify-end">
          <Button variant="white" size="sm" onClick={skipSetup} disabled={skipping}>
            {skipping ? "Skipping..." : "Skip for now →"}
          </Button>
        </div>

        <div className="mb-8 text-center">
          <p className="text-xs font-black uppercase tracking-widest text-neutral-600">Welcome, {user?.firstName}</p>
          <h1 className="neo-heading mt-2 text-3xl md:text-4xl">Get value in 5 minutes</h1>
          <p className="mt-2 text-sm font-medium">Set up once — then paste jobs and apply with AI every day.</p>
          <p className="mt-1 text-xs font-medium text-neutral-500">Progress saves automatically if you leave.</p>
        </div>

        <div className="mb-8 flex justify-center gap-2">
          {STEPS.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => i <= step && setStep(i)}
              className={`flex items-center gap-2 ${i <= step ? "cursor-pointer" : "cursor-default opacity-60"}`}
            >
              <span
                className={`neo-border flex h-8 w-8 items-center justify-center text-xs font-black ${
                  i < step ? "bg-[var(--color-lime)]" : i === step ? "bg-[var(--color-cyan)]" : "bg-white"
                }`}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span className="hidden text-xs font-bold uppercase sm:inline">{label}</span>
              {i < STEPS.length - 1 && <span className="text-neutral-400">→</span>}
            </button>
          ))}
        </div>

        {step === 0 && (
          <Card className="bg-[var(--color-lime)]">
            <h2 className="neo-heading text-sm">Step 1 — Pick your challenge</h2>
            <p className="mt-2 text-sm font-medium">How many days will you apply at least once per day?</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {COMMITMENT_OPTIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setCommitmentDays(d)}
                  className={`neo-border px-4 py-2 text-sm font-black uppercase transition ${
                    commitmentDays === d ? "neo-shadow-sm bg-[var(--color-yellow)]" : "bg-white hover:bg-neutral-100"
                  }`}
                >
                  {d} days
                </button>
              ))}
            </div>
            <Button variant="lime" className="mt-6 w-full" onClick={saveCommitment} disabled={savingCommitment}>
              {savingCommitment ? "Saving..." : "Start challenge"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Card>
        )}

        {step === 1 && (
          <Card className="bg-[var(--color-cyan)]">
            <h2 className="neo-heading text-sm">Step 2 — Upload one resume</h2>
            <p className="mt-2 text-sm font-medium">PDF only. You can add more tracks later in Goal Session.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {RESUME_TRACKS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTrack(t)}
                  className={`neo-border px-3 py-1.5 text-xs font-black uppercase ${
                    track === t ? "bg-[var(--color-lime)]" : "bg-white"
                  }`}
                >
                  {RESUME_TRACK_LABELS[t]}
                </button>
              ))}
            </div>
            <label className="neo-btn neo-btn-lime mt-6 flex w-full cursor-pointer items-center justify-center gap-2 py-3">
              <Upload className="h-5 w-5" />
              {uploading ? "Uploading..." : hasResume ? "Resume ready — continue" : "Upload PDF"}
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadResume(f);
                }}
              />
            </label>
            {hasResume && (
              <Button variant="white" className="mt-3 w-full" onClick={() => setStep(2)}>
                Continue with saved resume
              </Button>
            )}
          </Card>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <Card className="bg-[var(--color-yellow)]">
              <h2 className="neo-heading text-sm">Step 3 — See AI in action</h2>
              <p className="mt-2 text-sm font-medium">
                One click preview with a sample job — no real apply, just feel the magic.
              </p>
              <Button variant="lime" className="mt-4 w-full" onClick={runSamplePreview} disabled={previewing}>
                <Zap className="h-4 w-4" />
                {previewing ? "AI analyzing..." : "Run sample preview"}
              </Button>
              {!hasResume && (
                <p className="mt-3 text-xs font-bold">No resume? Skip setup and upload later in Goal Session.</p>
              )}
            </Card>

            {preview && (
              <Card className="bg-white text-center">
                <p className="text-xs font-black uppercase">Your match score</p>
                <p className="neo-heading text-5xl">{preview.match.matchScore}%</p>
                <p className="mt-1 font-bold">{preview.parsed.position} @ {preview.parsed.companyName}</p>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {preview.match.strongSkills.slice(0, 4).map((s) => (
                    <Tag key={s} variant="lime">{s}</Tag>
                  ))}
                </div>
                <p className="mt-4 text-xs font-medium text-neutral-600">
                  Real jobs work the same — plus cover letter, email, and one-click apply.
                </p>
              </Card>
            )}

            <Button
              variant="lime"
              className="w-full"
              onClick={finish}
              disabled={finishing || !preview}
            >
              <Sparkles className="h-4 w-4" />
              {finishing ? "Finishing..." : "Start applying for real →"}
            </Button>
            {!preview && hasResume && (
              <Button variant="white" className="w-full" onClick={skipSetup} disabled={skipping}>
                Skip preview — go to Goal Session
              </Button>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
