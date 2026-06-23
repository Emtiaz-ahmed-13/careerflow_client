"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { DashboardLayout, PageHeader } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/input";
import { JobPastePanel } from "@/components/shared/job-paste-panel";
import { Tag } from "@/components/shared/tag";
import { api, uploadFile } from "@/lib/api/client";
import type { ResumeAnalysis } from "@/types";

export default function ResumeAnalyzerPage() {
  const [tab, setTab] = useState<"match" | "review">("match");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeDocId, setResumeDocId] = useState<string | undefined>();
  const [result, setResult] = useState<ResumeAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      if (tab === "match") {
        if (!jobDescription.trim()) return alert("Paste job description");
        const data = await api<ResumeAnalysis>("/ai/resume/match", {
          method: "POST",
          body: JSON.stringify({ jobDescriptionText: jobDescription, documentId: resumeDocId }),
        });
        setResult(data);
      } else {
        if (!resumeDocId) return alert("Upload resume first");
        const data = await api<ResumeAnalysis>("/ai/resume/review", {
          method: "POST",
          body: JSON.stringify({ documentId: resumeDocId }),
        });
        setResult(data);
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader title="Resume Analyzer" subtitle="Match against jobs or run ATS review" />

      <div className="mb-6 flex gap-2">
        <Button variant={tab === "match" ? "lime" : "white"} onClick={() => setTab("match")}>Match Analyzer</Button>
        <Button variant={tab === "review" ? "lime" : "white"} onClick={() => setTab("review")}>ATS Review</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          {tab === "match" && (
            <JobPastePanel jobDescription={jobDescription} onJobDescriptionChange={setJobDescription} onResumeUploaded={setResumeDocId} />
          )}
          {tab === "review" && (
            <Card className="bg-[var(--color-lime)]">
              <label className="neo-border neo-shadow-sm flex cursor-pointer flex-col items-center gap-3 bg-white p-8 font-bold uppercase transition hover:bg-neutral-50">
                <Upload className="h-8 w-8 stroke-[2.5]" />
                <span>Upload Resume PDF</span>
                <input type="file" accept=".pdf" className="hidden" onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    const doc = await uploadFile("/documents/upload", f, { type: "Resume" });
                    setResumeDocId(doc.id);
                  }
                }} />
              </label>
            </Card>
          )}
          <Button variant="lime" onClick={run} disabled={loading} className="w-full">
            {loading ? "Analyzing..." : "Run Analysis"}
          </Button>
        </div>

        {result && (
          <Card className="space-y-4 bg-white">
            {(result.matchScore != null || result.atsScore != null) && (
              <div className="neo-border bg-[var(--color-yellow)] p-6 text-center neo-shadow-sm">
                <p className="neo-heading text-5xl">{result.matchScore ?? result.atsScore}%</p>
              </div>
            )}
            {result.strongSkills?.length > 0 && <List title="Strong Skills" items={result.strongSkills as string[]} tag="lime" />}
            {result.missingSkills?.length > 0 && <List title="Missing Skills" items={result.missingSkills as string[]} tag="pink" />}
            {result.grammarIssues?.length > 0 && <List title="Grammar Issues" items={result.grammarIssues as string[]} tag="orange" />}
            {result.formattingIssues?.length > 0 && <List title="Formatting" items={result.formattingIssues as string[]} tag="yellow" />}
            {result.missingKeywords?.length > 0 && <List title="Missing Keywords" items={result.missingKeywords as string[]} tag="pink" />}
            {result.suggestions?.length > 0 && <List title="Suggestions" items={result.suggestions as string[]} tag="lime" />}
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

function List({ title, items, tag }: { title: string; items: string[]; tag: "lime" | "pink" | "orange" | "yellow" }) {
  return (
    <div>
      <h3 className="neo-heading text-xs">{title}</h3>
      <ul className="mt-2 space-y-1 text-sm font-medium">
        {items.map((s, i) => (
          <li key={i} className="flex items-start gap-2">
            <Tag variant={tag}>{i + 1}</Tag>
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
