export type ResumeTrack = "Backend" | "Frontend" | "SoftwareEngineer";

export const RESUME_TRACKS: ResumeTrack[] = ["Backend", "Frontend", "SoftwareEngineer"];

export const RESUME_TRACK_LABELS: Record<ResumeTrack, string> = {
  Backend: "Backend Developer",
  Frontend: "Frontend Developer",
  SoftwareEngineer: "Software Engineer",
};

export type ResumeDocument = {
  id: string;
  fileName: string;
  resumeTrack: ResumeTrack | null;
  createdAt: string;
};

export type ParsedJobDetails = {
  companyName: string;
  position: string;
  jobUrl: string | null;
  recruiterEmail: string | null;
};

export type DailyGoal = {
  target: number;
  completedToday: number;
  appliesToday?: number;
  met: boolean;
  streak: number;
  streakBroken?: boolean;
  commitmentDays: number;
  commitmentDay: number;
  commitmentDaysRemaining: number;
  commitmentDaysHit: number;
  commitmentActive: boolean;
  startedAt: string;
  message: string;
};

export const COMMITMENT_OPTIONS = [7, 14, 30, 60, 90] as const;
export type CommitmentDays = (typeof COMMITMENT_OPTIONS)[number];

export type GoalSessionPreview = {
  manual?: boolean;
  jobDescriptionText: string;
  jobUrl: string | null;
  resumeTrack: ResumeTrack;
  suggestedTrack: { track: ResumeTrack; reason: string };
  parsed: ParsedJobDetails;
  match: { matchScore: number | null; strongSkills: string[]; missingSkills: string[] };
  email: { subject: string; content: string };
  lowMatch: boolean;
  matchThreshold: number;
  emailConfigured: boolean;
};

export type GoalSessionResult = {
  application?: JobApplication;
  match?: ResumeAnalysis;
  coverLetter?: { content: string };
  email?: ApplicationEmail;
  dailyGoal?: DailyGoal;
  recruiterEmail?: string | null;
  parsed?: ParsedJobDetails;
  emailSent?: boolean;
  resumeAttached?: boolean;
  emailError?: string;
  skipped?: boolean;
  message?: string;
};

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  headline?: string;
  phone: string;
  location?: string;
  linkedinUrl: string;
  githubUrl: string;
  avatarUrl?: string;
  emailStyle?: string | null;
  coverLetterStyle?: string | null;
};

export type ApplicationStatus =
  | "Applied"
  | "Assessment"
  | "Interview"
  | "FinalInterview"
  | "Offer"
  | "Rejected";

export type JobApplication = {
  id: string;
  companyName: string;
  position: string;
  jobUrl?: string;
  salary?: string;
  location?: string;
  deadline?: string;
  notes?: string;
  status: ApplicationStatus;
  jobDescriptionText?: string;
  kanbanOrder: number;
  createdAt: string;
  coverLetters?: { id: string; content: string; createdAt?: string }[];
  applicationEmails?: { id: string; subject: string; content: string; createdAt?: string }[];
  resumeAnalyses?: { matchScore?: number | null; strongSkills?: string[]; missingSkills?: string[]; suggestions?: string[]; createdAt?: string }[];
  reminders?: { id: string; title: string; remindAt: string; isCompleted: boolean; createdAt: string }[];
};

export type Reminder = {
  id: string;
  title: string;
  remindAt: string;
  isCompleted: boolean;
  application?: { id: string; companyName: string; position: string };
};

export type DashboardMetrics = {
  totalApplications: number;
  interviews: number;
  offers: number;
  rejections: number;
  responseRate: number;
  interviewRate: number;
  offerRate: number;
  byStatus: Record<string, number>;
  weeklyApplies?: { week: string; count: number }[];
};

export type ResumeAnalysis = {
  id: string;
  matchScore?: number;
  atsScore?: number;
  strongSkills: string[];
  missingSkills: string[];
  weakAreas: string[];
  grammarIssues: string[];
  formattingIssues: string[];
  missingKeywords: string[];
  suggestions: string[];
  analysisType: "Match" | "Review";
  createdAt: string;
};

export type ApplicationEmail = {
  id: string;
  subject: string;
  content: string;
  companyName: string;
  position: string;
  createdAt: string;
};

export const STATUS_COLUMNS: ApplicationStatus[] = [
  "Applied",
  "Assessment",
  "Interview",
  "FinalInterview",
  "Offer",
  "Rejected",
];

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  Applied: "Applied",
  Assessment: "Assessment",
  Interview: "Interview",
  FinalInterview: "Final Interview",
  Offer: "Offer",
  Rejected: "Rejected",
};
