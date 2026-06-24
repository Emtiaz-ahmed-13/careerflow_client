"use client";

import { useState } from "react";
import { ClipboardPaste, Link2, Sparkles, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea, Label, Card, Input } from "@/components/ui/input";
import { uploadFile } from "@/lib/api/client";
import { toast } from "@/lib/toast";
import type { ResumeTrack } from "@/types";
import { RESUME_TRACKS, RESUME_TRACK_LABELS } from "@/types";

function isLinkedInUrl(text: string) {
  return /linkedin\.com/i.test(text);
}

type Props = {
  onJobDescriptionChange: (text: string) => void;
  jobDescription: string;
  jobUrl?: string;
  onJobUrlChange?: (url: string) => void;
  onResumeUploaded?: (docId: string) => void;
  showPasteHint?: boolean;
  hideResumeUpload?: boolean;
  extracting?: boolean;
  track?: ResumeTrack;
  onTrackChange?: (track: ResumeTrack) => void;
  trackReady?: Record<ResumeTrack, boolean>;
  suggestedTrack?: ResumeTrack;
  suggestReason?: string;
  fetchError?: string | null;
  onTryFetchUrl?: () => void;
  fetchingUrl?: boolean;
};

export function JobPastePanel({
  onJobDescriptionChange,
  jobDescription,
  jobUrl = "",
  onJobUrlChange,
  onResumeUploaded,
  showPasteHint = true,
  hideResumeUpload = false,
  extracting = false,
  track,
  onTrackChange,
  trackReady,
  suggestedTrack,
  suggestReason,
  fetchError,
  onTryFetchUrl,
  fetchingUrl,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const showLinkedInHint = isLinkedInUrl(jobUrl) || isLinkedInUrl(jobDescription);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      onJobDescriptionChange(text);
      toast.success("Pasted!");
    } catch {
      toast.error("Allow clipboard access or paste manually (Ctrl+V)");
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const doc = await uploadFile("/documents/upload", file, { type: "Resume" });
      setResumeId(doc.id);
      onResumeUploaded?.(doc.id);
      toast.success("Resume uploaded!");
    } catch {
      toast.error("Upload failed — use a valid PDF");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="space-y-4 bg-[var(--color-lime)]">
      {showPasteHint && (
        <div className="neo-border bg-[var(--color-yellow)] p-3 text-sm font-bold">
          Paste LinkedIn URL + full job description below. Auto-fetch often fails on LinkedIn — manual paste is most reliable.
        </div>
      )}

      {showLinkedInHint && (
        <div className="neo-border flex gap-2 bg-[var(--color-cyan)] p-3 text-sm font-bold">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div>
            <p>LinkedIn blocks bots. Open the job → Select All → Copy → Paste in the box below.</p>
            <p className="mt-1 text-xs font-medium">URL alone is usually not enough.</p>
          </div>
        </div>
      )}

      {fetchError && (
        <div className="neo-border bg-[var(--color-pink)] p-3 text-sm font-bold">
          {fetchError} — paste the full job description manually.
        </div>
      )}

      {track && onTrackChange && (
        <div>
          <Label>Resume type</Label>
          {suggestedTrack && suggestReason && (
            <p className="mt-1 text-xs font-bold text-neutral-700">
              AI suggests <span className="uppercase">{RESUME_TRACK_LABELS[suggestedTrack]}</span> — {suggestReason}
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            {RESUME_TRACKS.map((t) => {
              const ready = trackReady?.[t] ?? true;
              const isSuggested = suggestedTrack === t;
              return (
                <Button
                  key={t}
                  type="button"
                  variant={track === t ? "lime" : "white"}
                  size="sm"
                  disabled={!ready}
                  onClick={() => onTrackChange(t)}
                >
                  {RESUME_TRACK_LABELS[t]}
                  {isSuggested && " ★"}
                  {!ready && " (upload above)"}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <Label>LinkedIn / Job URL (optional)</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          <Input
            value={jobUrl}
            onChange={(e) => onJobUrlChange?.(e.target.value)}
            placeholder="https://linkedin.com/jobs/view/..."
            className="min-w-0 flex-1 bg-white"
          />
          {onTryFetchUrl && jobUrl.trim() && (
            <Button type="button" variant="yellow" size="sm" onClick={onTryFetchUrl} disabled={fetchingUrl || extracting}>
              <Link2 className="h-4 w-4" />
              {fetchingUrl ? "Fetching..." : "Try fetch"}
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label>Job Description *</Label>
        <div className="flex gap-2">
          {extracting && (
            <span className="flex items-center gap-1 text-xs font-black uppercase">
              <Sparkles className="h-3 w-3 animate-pulse" /> AI working...
            </span>
          )}
          <Button type="button" variant="yellow" size="sm" onClick={handlePaste}>
            <ClipboardPaste className="h-4 w-4" /> Paste
          </Button>
        </div>
      </div>
      <Textarea
        placeholder="Paste the FULL LinkedIn job post here (company, role, requirements)..."
        value={jobDescription}
        onChange={(e) => onJobDescriptionChange(e.target.value)}
        className="min-h-[200px] bg-white font-mono text-sm"
      />

      {!hideResumeUpload && (
        <div>
          <Label>Resume (PDF)</Label>
          <label className="neo-border neo-shadow-sm mt-2 flex cursor-pointer items-center gap-3 bg-white p-4 font-bold uppercase transition hover:bg-neutral-50">
            <span className="text-sm">{uploading ? "Uploading..." : resumeId ? "Resume uploaded ✓" : "Upload resume PDF"}</span>
            <input type="file" accept=".pdf" className="hidden" onChange={handleResumeUpload} disabled={uploading} />
          </label>
        </div>
      )}
    </Card>
  );
}
