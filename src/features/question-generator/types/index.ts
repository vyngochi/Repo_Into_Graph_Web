export interface GeneratedQuestion {
  id: string;
  question: string;
  suggestedAnswer: string;
  difficulty: string;
}

export interface FewShotExample {
  id: string;
  question: string;
  tag?: string;
}
