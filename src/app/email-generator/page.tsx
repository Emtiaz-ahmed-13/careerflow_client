"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { DashboardLayout, PageHeader } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input, Label, Card } from "@/components/ui/input";
import { JobPastePanel } from "@/components/shared/job-paste-panel";
import { api } from "@/lib/api/client";
import { copyToClipboard } from "@/lib/utils";
import type { ApplicationEmail } from "@/types";

export default function EmailGeneratorPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [position, setPosition] = useState("");
  const [email, setEmail] = useState<ApplicationEmail | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!jobDescription.trim() || !companyName || !position) {
      return alert("Fill company, position, and paste job description");
    }
    setLoading(true);
    try {
      const data = await api<ApplicationEmail>("/ai/email/generate", {
        method: "POST",
        body: JSON.stringify({ jobDescriptionText: jobDescription, companyName, position }),
      });
      setEmail(data);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Email Generator"
        subtitle="Paste a LinkedIn job — AI writes email using your LinkedIn, GitHub, email & phone"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <Card className="grid grid-cols-2 gap-4 bg-[var(--color-cyan)]">
            <div><Label>Company *</Label><Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="mt-2 bg-white" /></div>
            <div><Label>Position *</Label><Input value={position} onChange={(e) => setPosition(e.target.value)} className="mt-2 bg-white" /></div>
          </Card>
          <JobPastePanel jobDescription={jobDescription} onJobDescriptionChange={setJobDescription} showPasteHint />
          <Button variant="lime" onClick={generate} disabled={loading} className="w-full">
            {loading ? "Generating..." : "Generate Email"}
          </Button>
        </div>

        {email && (
          <Card className="space-y-4 bg-white">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase">Subject</p>
                <p className="mt-1 font-bold">{email.subject}</p>
              </div>
              <Button variant="yellow" size="sm" onClick={() => { copyToClipboard(`Subject: ${email.subject}\n\n${email.content}`); alert("Copied!"); }}>
                <Copy className="h-4 w-4" /> Copy All
              </Button>
            </div>
            <div className="neo-border bg-[#f3f3f3] p-4 text-sm font-medium leading-relaxed whitespace-pre-wrap">{email.content}</div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
