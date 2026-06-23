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
