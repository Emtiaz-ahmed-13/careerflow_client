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
            "neo-border neo-shadow flex w-full items-center gap-3 bg-white px-4 py-3 font-bold text-sm text-black",
          title: "font-black uppercase tracking-wide",
          description: "font-medium text-neutral-700",
          closeButton:
            "neo-border !absolute !right-2 !top-2 !left-auto !transform-none bg-[var(--color-yellow)] !border-black",
          success: "bg-[var(--color-lime)]",
          error: "bg-[var(--color-pink)]",
          info: "bg-[var(--color-cyan)]",
        },
      }}
    />
  );
}
