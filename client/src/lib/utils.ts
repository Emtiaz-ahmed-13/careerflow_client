import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

/** User-friendly Goal Session preview error message */
export function previewErrorMessage(msg: string, jobDescription: string, jobUrl: string) {
  const lower = msg.toLowerCase();

  if (/ai failed|try again|service unavailable|503/i.test(msg)) {
    return msg;
  }
  if (/upload.*resume|vault/i.test(msg)) {
    return msg;
  }
  if (/paste|fetch|linkedin|job description|could not fetch/i.test(lower)) {
    if (jobUrl.includes("linkedin") && jobDescription.length < 150) {
      return "LinkedIn blocked auto-fetch — copy-paste the full job description below";
    }
    return msg.includes("paste") ? msg : `${msg} — paste full job description below`;
  }
  if (/internal server error|something went wrong|timeout|timed out/i.test(lower)) {
    return "Server or AI timed out — paste the full job description and try Preview again";
  }

  return msg;
}

export function openEmailComposer({
  to,
  subject,
  body,
}: {
  to?: string;
  subject: string;
  body: string;
}) {
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  const mailto = `mailto:${encodeURIComponent(to ?? "")}?${params.toString()}`;
  window.location.href = mailto;
}
