"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      closeButton
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "neo-border neo-shadow flex w-full items-center gap-3 bg-[var(--color-card)] px-4 py-3 font-bold text-sm text-[var(--color-foreground)]",
          title: "font-black uppercase tracking-wide",
          description: "font-medium text-[var(--color-muted)]",
          closeButton:
            "neo-border !absolute !right-2 !top-2 !left-auto !transform-none bg-[var(--color-yellow)] !border-[var(--color-border)] text-[#0a0a0a]",
          success: "bg-[var(--color-lime)] text-[#0a0a0a]",
          error: "bg-[var(--color-pink)] text-[#0a0a0a]",
          info: "bg-[var(--color-cyan)] text-[#0a0a0a]",
        },
      }}
    />
  );
}