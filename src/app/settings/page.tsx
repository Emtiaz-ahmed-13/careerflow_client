"use client";

import { useEffect, useState } from "react";
import { DashboardLayout, PageHeader } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, Textarea, Label } from "@/components/ui/input";
import { Tag } from "@/components/shared/tag";
import { api } from "@/lib/api/client";
import { toast } from "@/lib/toast";
import { useAuth } from "@/providers/auth-provider";
import type { User } from "@/types";

type Insights = {
  bestPerformingSkills: string[];
  bestJobCategories: string[];
  areasToImprove: string[];
  recommendations: string[];
};

const EMAIL_STYLE_EXAMPLE = `Example format:
- Start: "Assalamu Alaikum bhaiya" or "Hi [Name]"
- Tone: respectful, industry boro bhaiya style
- Mention: 2 years experience, key skills
- End: "Apnar consideration er jonno dhonnobad"
- Sign off with name + phone + LinkedIn`;

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [emailStyle, setEmailStyle] = useState("");

  useEffect(() => {
    if (user) {
      setEmailStyle(user.emailStyle ?? "");
    }
  }, [user]);

  const saveWritingStyle = async () => {
    setSaving(true);
    try {
      await api<User>("/users/profile", {
        method: "PATCH",
        body: JSON.stringify({ emailStyle }),
      });
      await refreshUser();
      toast.success("Your writing style saved — AI will follow this format!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const loadInsights = async () => {
    setLoading(true);
    try {
      const data = await api<Insights>("/ai/career-insights");
      setInsights(data);
      toast.success("Career insights generated!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader title="Settings" subtitle="Your AI writing style + career insights" />

      <Card className="mb-8 max-w-3xl bg-[var(--color-lime)]">
        <h2 className="neo-heading text-sm">Chrome Extension — Save LinkedIn Jobs</h2>
        <p className="mt-2 text-sm font-medium">
          One-click import from LinkedIn to Goal Session. Install the unpacked extension from the repo:
        </p>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm font-bold">
          <li>Chrome → <code className="neo-border bg-white px-1">chrome://extensions</code></li>
          <li>Developer mode ON → Load unpacked</li>
          <li>Select folder: <code className="neo-border bg-white px-1">careerflow/extension</code></li>
          <li>Open LinkedIn job → click <strong>Save to CareerFlow</strong></li>
        </ol>
        <a
          href="https://client-mocha-five-q1k2xjicnj.vercel.app/goal-session"
          className="neo-btn neo-btn-lime mt-4 inline-block px-4 py-2 text-sm font-black"
        >
          Open Goal Session →
        </a>
      </Card>

      <Card className="mb-8 max-w-3xl bg-[var(--color-cyan)]">
        <h2 className="neo-heading text-sm">My Writing Style</h2>
        <p className="mt-2 text-sm font-medium">
          Tell AI exactly how you want application emails written. Not generic — your format, your tone.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <Label>Email format &amp; tone</Label>
            <p className="mt-1 text-xs text-neutral-600">{EMAIL_STYLE_EXAMPLE}</p>
            <Textarea
              value={emailStyle}
              onChange={(e) => setEmailStyle(e.target.value)}
              placeholder="Describe how you want application emails written..."
              className="mt-2 min-h-[140px] bg-white text-sm"
            />
          </div>
          <Button variant="lime" onClick={saveWritingStyle} disabled={saving}>
            {saving ? "Saving..." : "Save My Style"}
          </Button>
        </div>
      </Card>

      <Card className="max-w-2xl bg-[var(--color-yellow)]">
        <h2 className="neo-heading text-sm">AI Career Insights</h2>
        <p className="mt-2 text-sm font-medium">Analyze your application history for patterns.</p>
        <Button variant="lime" onClick={loadInsights} disabled={loading} className="mt-4">
          {loading ? "Analyzing..." : "Generate Insights"}
        </Button>
        {insights && (
          <div className="mt-6 space-y-5">
            <InsightList title="Best Performing Skills" items={insights.bestPerformingSkills} tag="lime" />
            <InsightList title="Best Job Categories" items={insights.bestJobCategories} tag="cyan" />
            <InsightList title="Areas to Improve" items={insights.areasToImprove} tag="pink" />
            <InsightList title="Recommendations" items={insights.recommendations} tag="orange" />
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}

function InsightList({ title, items, tag }: { title: string; items: string[]; tag: "lime" | "pink" | "orange" | "yellow" | "cyan" }) {
  return (
    <div>
      <h3 className="neo-heading text-xs">{title}</h3>
      <ul className="mt-2 flex flex-wrap gap-2">
        {(items ?? []).map((item, i) =>
          tag === "cyan" ? (
            <span key={i} className="neo-border inline-block bg-[var(--color-cyan)] px-2 py-0.5 text-[10px] font-black uppercase shadow-[2px_2px_0_0_#000]">
              {item}
            </span>
          ) : (
            <Tag key={i} variant={tag}>{item}</Tag>
          ),
        )}
      </ul>
    </div>
  );
}
