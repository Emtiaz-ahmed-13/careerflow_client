"use client";

import { RedirectToGoalSession } from "@/components/shared/redirect-to-goal-session";
import { DashboardLayout } from "@/components/layout/sidebar";

export default function CoverLetterRedirect() {
  return (
    <DashboardLayout>
      <RedirectToGoalSession />
    </DashboardLayout>
  );
}
