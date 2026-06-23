"use client";

import { useState } from "react";
import { DashboardLayout, PageHeader } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/input";
import { JobPastePanel } from "@/components/shared/job-paste-panel";
import { Tag } from "@/components/shared/tag";
import { api } from "@/lib/api/client";

type Question = { question: string; tip: string; difficulty: string };

const DIFFICULTY_TAG: Record<string, "lime" | "yellow" | "pink"> = {
  Easy: "lime",
  Medium: "yellow",
  Hard: "pink",
};

export default function InterviewPrepPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [category, setCategory] = useState<"HR" | "Technical" | "Behavioral">("HR");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!jobDescription.trim()) return alert("Paste job description");
    setLoading(true);
    try {
      const data = await api<{ questions: Question[] }>("/ai/interview/questions", {
        method: "POST",
        body: JSON.stringify({ jobDescriptionText: jobDescription, category }),
      });
      setQuestions(data.questions);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader title="Interview Prep" subtitle="Generate HR, technical, or behavioral questions from any job post" />

      <div className="mb-6 flex flex-wrap gap-2">
        {(["HR", "Technical", "Behavioral"] as const).map((c) => (
          <Button key={c} variant={category === c ? "lime" : "white"} onClick={() => setCategory(c)}>{c}</Button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <JobPastePanel jobDescription={jobDescription} onJobDescriptionChange={setJobDescription} />
          <Button variant="lime" onClick={generate} disabled={loading} className="w-full">
            {loading ? "Generating..." : "Generate Questions"}
          </Button>
        </div>
        <div className="space-y-3">
          {questions.map((q, i) => (
            <Card key={i} className="bg-white">
              <p className="neo-heading text-sm leading-snug">{i + 1}. {q.question}</p>
              <p className="mt-2 text-sm font-medium text-neutral-700">Tip: {q.tip}</p>
              <Tag variant={DIFFICULTY_TAG[q.difficulty] ?? "yellow"} className="mt-3">
                {q.difficulty}
              </Tag>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
