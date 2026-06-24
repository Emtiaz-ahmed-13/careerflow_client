"use client";

import { useEffect, useState } from "react";
import { Chrome, ClipboardPaste, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/input";

const GUIDE_KEY = "careerflow_seen_paste_guide";

export function JobPasteGuide({ onDismiss }: { onDismiss?: () => void }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(localStorage.getItem(GUIDE_KEY) !== "1");
  }, []);

  const dismiss = () => {
    localStorage.setItem(GUIDE_KEY, "1");
    setOpen(false);
    onDismiss?.();
  };

  if (!open) return null;

  return (
    <Card className="relative mb-6 bg-[var(--color-yellow)]">
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-3 top-3 neo-border bg-white p-1"
        aria-label="Dismiss guide"
      >
        <X className="h-4 w-4" />
      </button>
      <h2 className="neo-heading pr-10 text-sm">Your first real job — 3 ways</h2>
      <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm font-bold">
        <li className="flex flex-col gap-1">
          <span className="flex items-center gap-2">
            <Chrome className="h-4 w-4" />
            <strong>Chrome extension (fastest)</strong>
          </span>
          <span className="text-xs font-medium text-neutral-700">
            Install <code className="neo-border bg-white px-1">extension/</code> folder → open LinkedIn job → click
            &quot;Save to CareerFlow&quot;
          </span>
        </li>
        <li>
          <strong>Manual paste</strong> — LinkedIn job page → Cmd+A → Cmd+C → click Paste below
          <ClipboardPaste className="ml-1 inline h-3 w-3" />
        </li>
        <li>
          <strong>Job URL</strong> — paste LinkedIn link, then click &quot;Try fetch&quot; (often needs manual paste too)
        </li>
      </ol>
      <Button variant="lime" size="sm" className="mt-4" onClick={dismiss}>
        Got it — let&apos;s apply
      </Button>
    </Card>
  );
}

export type ExtensionImportJob = {
  url: string;
  description: string;
  title: string;
  company: string;
};

export function useExtensionJobImport(onImport: (job: ExtensionImportJob) => void) {
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "CAREERFLOW_IMPORT_JOB" && e.data.job) {
        onImport(e.data.job as ExtensionImportJob);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [onImport]);
}
