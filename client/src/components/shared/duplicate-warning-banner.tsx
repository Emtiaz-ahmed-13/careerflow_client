import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import type { DuplicateWarning } from "@/lib/duplicate-application";
import { formatDuplicateMessage } from "@/lib/duplicate-application";

export function DuplicateWarningBanner({ duplicate }: { duplicate: DuplicateWarning }) {
  return (
    <div className="neo-border flex flex-col gap-3 bg-[var(--color-yellow)] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="text-xs font-black uppercase">Possible duplicate apply</p>
          <p className="mt-1 text-sm font-bold">{formatDuplicateMessage(duplicate)}</p>
          <p className="mt-1 text-xs font-medium text-muted">
            Status: {duplicate.status} — you can still continue if this is a different role.
          </p>
        </div>
      </div>
      <Link
        href={`/applications/${duplicate.applicationId}`}
        className="neo-border neo-shadow-sm shrink-0 bg-[var(--color-card)] px-3 py-2 text-xs font-black uppercase hover:translate-x-[1px] hover:translate-y-[1px]"
      >
        View previous
      </Link>
    </div>
  );
}