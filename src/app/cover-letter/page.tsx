"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { DashboardLayout, PageHeader } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/input";
import { JobPastePanel } from "@/components/shared/job-paste-panel";
import { api } from "@/lib/api/client";
import { copyToClipboard } from "@/lib/utils";

export default function CoverLetterPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeDocId, setResumeDocId] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!jobDescription.trim() || !resumeDocId) return alert("Upload resume and paste job description");
    setLoading(true);
    try {
      const data = await api<{ content: string }>("/ai/cover-letter/generate", {
        method: "POST",
        body: JSON.stringify({ resumeDocumentId: resumeDocId, jobDescriptionText: jobDescription }),
      });
      setContent(data.content);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader title="Cover Letter" subtitle="AI generates a tailored cover letter from your resume + job post" />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <JobPastePanel jobDescription={jobDescription} onJobDescriptionChange={setJobDescription} onResumeUploaded={setResumeDocId} />
          <Button variant="lime" onClick={generate} disabled={loading} className="w-full">
            {loading ? "Generating..." : "Generate Cover Letter"}
          </Button>
        </div>
        {content && (
          <Card className="bg-white">
            <div className="mb-4 flex justify-end">
              <Button variant="yellow" size="sm" onClick={() => { copyToClipboard(content); alert("Copied!"); }}>
                <Copy className="h-4 w-4" /> Copy
              </Button>
            </div>
            <div className="neo-border bg-[#f3f3f3] p-4 text-sm font-medium leading-relaxed whitespace-pre-wrap">{content}</div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
