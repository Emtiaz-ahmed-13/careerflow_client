"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function RedirectToGoalSession() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/goal-session");
  }, [router]);
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p className="font-bold uppercase">Redirecting to Goal Session...</p>
    </div>
  );
}
