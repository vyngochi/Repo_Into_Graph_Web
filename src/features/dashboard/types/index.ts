export interface AnalysisRun {
  id: string;
  repoName?: string;
  repoOwner?: string;
  repoDescription?: string;
  repoUrl?: string;
  repoLanguage?: string;
  repositoryPath?: string;
  isPublic?: boolean;
  repoStars?: number;
  status?: string;
  createdAt?: string;
}

export interface FewShot {
  id: string;
  question: string;
  suggestedAnswer: string;
  difficulty: string;
  tag?: string;
  description?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
