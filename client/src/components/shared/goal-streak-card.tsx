"use client";

import { Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/input";
import type { CommitmentDays, DailyGoal } from "@/types";
import { COMMITMENT_OPTIONS } from "@/types";

type Props = {
  goal: DailyGoal;
  showCommitmentPicker?: boolean;
  onCommitmentChange?: (days: CommitmentDays) => void;
  savingCommitment?: boolean;
};

export function GoalStreakCard({
  goal,
  showCommitmentPicker,
  onCommitmentChange,
  savingCommitment,
}: Props) {
  const progress = Math.round((goal.commitmentDaysHit / goal.commitmentDays) * 100);

  return (
    <Card className={goal.met ? "bg-[var(--color-lime)]" : "bg-[var(--color-cyan)]"}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="neo-heading text-sm flex items-center gap-2">
            <Flame className="h-4 w-4" />
            {goal.streak} day streak
          </p>
          <p className="mt-2 text-2xl font-black uppercase">
            Day {goal.commitmentDay} / {goal.commitmentDays}
          </p>
          <p className="mt-1 text-xs font-bold">
            {goal.commitmentDaysHit} apply days · {goal.commitmentDaysRemaining} days left in challenge
          </p>
        </div>
        <div className="neo-border bg-white px-4 py-3 text-center neo-shadow-sm">
          <p className="text-[10px] font-black uppercase">Today</p>
          <p className="neo-heading text-3xl">{goal.met ? "✓" : "—"}</p>
          {(goal.appliesToday ?? goal.completedToday) > 0 && (
            <p className="text-[10px] font-bold">{goal.appliesToday ?? goal.completedToday} applied</p>
          )}
        </div>
      </div>

      <div className="mt-4 neo-border h-3 overflow-hidden bg-white">
        <div
          className="h-full bg-[var(--color-yellow)] transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="mt-3 font-bold">{goal.message}</p>

      {showCommitmentPicker && onCommitmentChange && (
        <div className="mt-5">
          <p className="text-xs font-black uppercase">Commitment — daily apply for</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {COMMITMENT_OPTIONS.map((days) => (
              <Button
                key={days}
                variant={goal.commitmentDays === days ? "lime" : "white"}
                size="sm"
                disabled={savingCommitment}
                onClick={() => onCommitmentChange(days)}
              >
                {days} days
              </Button>
            ))}
          </div>
          <p className="mt-2 text-xs font-medium text-neutral-700">
            Selecting resets your {goal.commitmentDays}-day challenge from today.
          </p>
        </div>
      )}
    </Card>
  );
}
