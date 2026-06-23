"use client";

import { useState } from "react";
import { Upload, ClipboardPaste } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea, Label, Card } from "@/components/ui/input";
import { uploadFile } from "@/lib/api/client";

type Props = {
  onJobDescriptionChange: (text: string) => void;
  jobDescription: string;
  onResumeUploaded?: (docId: string) => void;
  showPasteHint?: boolean;
};

export function JobPastePanel({ onJobDescriptionChange, jobDescription, onResumeUploaded, showPasteHint = true }: Props) {
  const [uploading, setUploading] = useState(false);
  const [resumeId, setResumeId] = useState<string | null>(null);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      onJobDescriptionChange(text);
    } catch {
      alert("Allow clipboard access or paste manually (Ctrl+V)");
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
    } catch {
      alert("Upload failed — use a valid PDF");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="space-y-4 bg-[var(--color-lime)]">
      {showPasteHint && (
        <div className="neo-border bg-[var(--color-yellow)] p-3 text-sm font-bold">
          LinkedIn Job? Copy the full post, click Paste, or paste below.
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <Label>Job Description</Label>
        <Button type="button" variant="yellow" size="sm" onClick={handlePaste}>
          <ClipboardPaste className="h-4 w-4" /> Paste
        </Button>
      </div>
      <Textarea
        placeholder="Paste LinkedIn job description here..."
        value={jobDescription}
        onChange={(e) => onJobDescriptionChange(e.target.value)}
        className="min-h-[200px] bg-white font-mono text-sm"
      />

      <div>
        <Label>Resume (PDF)</Label>
        <label className="neo-border neo-shadow-sm mt-2 flex cursor-pointer items-center gap-3 bg-white p-4 font-bold uppercase transition hover:bg-neutral-50">
          <Upload className="h-5 w-5 stroke-[2.5]" />
          <span className="text-sm">{uploading ? "Uploading..." : resumeId ? "Resume uploaded ✓" : "Upload resume PDF"}</span>
          <input type="file" accept=".pdf" className="hidden" onChange={handleResumeUpload} disabled={uploading} />
        </label>
      </div>
    </Card>
  );
}
