import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "lime" | "yellow" | "pink" | "white" | "cyan" | "outline";
  size?: "sm" | "md" | "lg";
};

export function Button({ className, variant = "lime", size = "md", ...props }: Props) {
  const variants = {
    lime: "neo-btn neo-btn-lime text-black",
    yellow: "neo-btn neo-btn-yellow text-black",
    pink: "neo-btn neo-btn-pink text-black",
    white: "neo-btn neo-btn-white text-black",
    cyan: "neo-btn neo-btn-cyan text-black",
    outline: "neo-btn neo-btn-white text-black bg-white",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
