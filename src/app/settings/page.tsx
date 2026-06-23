"use client";

import { useState } from "react";
import { DashboardLayout, PageHeader } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/input";
import { Tag } from "@/components/shared/tag";
import { api } from "@/lib/api/client";

type Insights = {
  bestPerformingSkills: string[];
  bestJobCategories: string[];
  areasToImprove: string[];
  recommendations: string[];
};

export default function SettingsPage() {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(false);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const data = await api<Insights>("/ai/career-insights");
      setInsights(data);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader title="Settings" subtitle="AI career insights from your application history" />

      <Card className="max-w-2xl bg-[var(--color-yellow)]">
        <h2 className="neo-heading text-sm">AI Career Insights</h2>
        <p className="mt-2 text-sm font-medium">
          Analyze your application history for patterns and recommendations.
        </p>
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
