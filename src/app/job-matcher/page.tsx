"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { DashboardLayout, PageHeader } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input, Label, Card } from "@/components/ui/input";
import { JobPastePanel } from "@/components/shared/job-paste-panel";
import { Tag } from "@/components/shared/tag";
import { api } from "@/lib/api/client";
import type { ResumeAnalysis } from "@/types";

export default function JobMatcherPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeDocId, setResumeDocId] = useState<string | undefined>();
  const [companyName, setCompanyName] = useState("");
  const [position, setPosition] = useState("");
  const [result, setResult] = useState<ResumeAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!jobDescription.trim()) return alert("Paste a job description first");
    setLoading(true);
    try {
      const data = await api<ResumeAnalysis>("/ai/resume/match", {
        method: "POST",
        body: JSON.stringify({ jobDescriptionText: jobDescription, documentId: resumeDocId }),
      });
      setResult(data);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Job Matcher"
        subtitle="Copy a LinkedIn job post, paste it here, AI matches against your resume"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <JobPastePanel
            jobDescription={jobDescription}
            onJobDescriptionChange={setJobDescription}
            onResumeUploaded={setResumeDocId}
          />
          <Card className="grid grid-cols-2 gap-4 bg-white">
            <div><Label>Company</Label><Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="mt-2" /></div>
            <div><Label>Position</Label><Input value={position} onChange={(e) => setPosition(e.target.value)} className="mt-2" /></div>
          </Card>
          <Button variant="lime" onClick={analyze} disabled={loading} className="w-full">
            <Sparkles className="h-4 w-4" />
            {loading ? "Analyzing..." : "Analyze Match"}
          </Button>
        </div>

        {result && (
          <Card className="space-y-5 bg-[var(--color-cyan)]">
            <div className="neo-border bg-white p-6 text-center neo-shadow-sm">
              <p className="text-xs font-black uppercase">Match Score</p>
              <p className="neo-heading mt-2 text-6xl">{result.matchScore}%</p>
            </div>
            <Section title="Strong Skills" items={result.strongSkills as string[]} tag="lime" />
            <Section title="Missing Skills" items={result.missingSkills as string[]} tag="pink" />
            <Section title="Weak Areas" items={result.weakAreas as string[]} tag="orange" />
            <Section title="Recommendations" items={result.suggestions as string[]} tag="yellow" />
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

function Section({ title, items, tag }: { title: string; items: string[]; tag: "lime" | "pink" | "orange" | "yellow" }) {
  return (
    <div>
      <h3 className="neo-heading text-xs">{title}</h3>
      <ul className="mt-2 space-y-1">
        {(items ?? []).map((s, i) => (
          <li key={i} className="flex items-start gap-2 text-sm font-medium">
            <Tag variant={tag}>{i + 1}</Tag>
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
