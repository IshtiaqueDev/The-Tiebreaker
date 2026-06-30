export interface Verdict {
  title: string;
  recommendation: string;
  reasoning: string;
  confidenceScore: number;
}

export interface ProCon {
  id: string;
  text: string;
  type: "pro" | "con";
  weight: "high" | "medium" | "low";
  category: string;
  // User adjustment: multiplier or rating (e.g., scale of 1 to 5)
  customWeight?: number; 
}

export interface ComparisonTable {
  headers: string[];
  rows: Array<{
    aspect: string;
    values: string[];
  }>;
}

export interface SWOTAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface TiebreakerFactor {
  question: string;
  insight: string;
}

export interface DecisionAnalysis {
  verdict: Verdict;
  prosCons: ProCon[];
  comparisonTable: ComparisonTable;
  swotAnalysis: SWOTAnalysis;
  tiebreakerFactor: TiebreakerFactor;
}

export interface Decision {
  id: string;
  title: string;
  context: string;
  options: string[];
  createdAt: string;
  analysis?: DecisionAnalysis;
}
