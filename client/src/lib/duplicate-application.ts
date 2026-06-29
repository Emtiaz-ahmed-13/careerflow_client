import type { JobApplication } from "@/types";

export type DuplicateWarning = {
  applicationId: string;
  companyName: string;
  position: string;
  appliedAt: string;
  status: string;
};

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function companiesMatch(a: string, b: string) {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb || na === "unknowncompany" || nb === "unknowncompany") return false;
  return na === nb || na.includes(nb) || nb.includes(na);
}

function positionsMatch(a?: string, b?: string) {
  if (!a?.trim() || !b?.trim()) return true;
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb || na === "unknownposition" || nb === "unknownposition") return true;
  return na === nb || na.includes(nb) || nb.includes(na);
}

export function findDuplicateApplication(
  apps: JobApplication[],
  companyName: string,
  position?: string,
): DuplicateWarning | null {
  const match = apps.find(
    (app) => companiesMatch(app.companyName, companyName) && positionsMatch(position, app.position),
  );
  if (!match) return null;
  return {
    applicationId: match.id,
    companyName: match.companyName,
    position: match.position,
    appliedAt: match.createdAt,
    status: match.status,
  };
}

/** Scan pasted job text for any company you've already applied to. */
export function findDuplicateInText(apps: JobApplication[], text: string): DuplicateWarning | null {
  const trimmed = text.trim();
  if (trimmed.length < 20) return null;

  for (const app of apps) {
    const name = app.companyName.trim();
    if (name.length < 3) continue;
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`\\b${escaped}\\b`, "i").test(trimmed)) {
      return {
        applicationId: app.id,
        companyName: app.companyName,
        position: app.position,
        appliedAt: app.createdAt,
        status: app.status,
      };
    }
  }
  return null;
}

export function formatDuplicateMessage(d: DuplicateWarning) {
  const date = new Date(d.appliedAt).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  return `You already applied to ${d.companyName} (${d.position}) on ${date}.`;
}
