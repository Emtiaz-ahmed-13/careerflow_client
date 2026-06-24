import { cn } from "@/lib/utils";

const variants = {
  lime: "neo-tag-lime",
  orange: "neo-tag-orange",
  yellow: "neo-tag-yellow",
  pink: "neo-tag-pink",
} as const;

export function Tag({
  children,
  variant = "lime",
  className,
}: {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block rounded px-2 py-0.5 text-[10px] font-black uppercase",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusTag({ status }: { status: string }) {
  const map: Record<string, keyof typeof variants> = {
    Applied: "yellow",
    Assessment: "orange",
    Interview: "lime",
    FinalInterview: "cyan" as keyof typeof variants,
    Offer: "lime",
    Rejected: "pink",
  };
  const v = map[status] ?? "orange";
  if (v === ("cyan" as keyof typeof variants)) {
    return (
      <span className="neo-border inline-block rounded bg-[var(--color-cyan)] px-2 py-0.5 text-[10px] font-black uppercase shadow-[2px_2px_0_0_#000]">
        {status}
      </span>
    );
  }
  return <Tag variant={v}>{status}</Tag>;
}
