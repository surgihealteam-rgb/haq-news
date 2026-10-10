export type VerificationStatus = "developing" | "unverified" | "under_review" | "assessment_published";
export type NewsStory = {
  id: string;
  title: string;
  summary: string;
  category: string;
  region: string;
  sourceName: string;
  sourceUrl: string;
  publishedAt: string;
  updatedAt: string;
  tags: string[];
  imageUrl?: string;
  verificationStatus: VerificationStatus;
  evidence: { label: string; url: string; kind: "primary" | "reporting" | "context" }[];
  isDemo?: boolean;
};
