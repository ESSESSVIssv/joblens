export interface MatchResponse {
  matchScore: number;
  verdict: string;
  summary: string;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  improvements: string[];
  coverLetter: string;
  gapAnalysis: {
    criticalGaps: string[];
    recommendations: string[];
  };
  atsOptimization: {
    suggestedKeywords: string[];
    revisedBullets: string[];
  };
  jobTitle: string;
  mentorExplanation: string;
}

export interface DiscoveryProfile {
  name: string;
  contact: string;
  education: string[];
  skills: string[];
  technicalSkills: string[];
  certifications: string[];
  projects: string[];
  experience: string[];
  internships: string[];
  achievements: string[];
  preferredRoles: string[];
  summary: string;
}

export interface JobMatchResult {
  jobTitle: string;
  company: string;
  platform: string;
  location: string;
  matchPercentage: number;
  requiredSkills: string[];
  missingSkills: string[];
  salary?: string;
  searchQueryLink: string;
  deadline?: string;
  category: "Easy Apply (High Match)" | "Moderate Match" | "Stretch Opportunity";
  resumeSuggestions: string;
  coverLetter: string;
}

export interface TrackedJob {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  link: string;
  salary?: string;
  status: 'Saved' | 'Applied' | 'Interviewing' | 'Offer' | 'Rejected';
  dateAdded: string;
}

export interface DiscoveryResponse {
  profile: DiscoveryProfile;
  jobs: JobMatchResult[];
}
