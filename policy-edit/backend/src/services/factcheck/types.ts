export type PrInfo = {
  owner: string;
  repo: string;
  prNumber: number;
};

export type PrDiff = {
  title: string;
  description: string;
  changes: string;
};

export type FactCheckAnalysis = {
  summary: string;
  details: FactCheckDetail[];
  conclusion: string;
};

export type FactCheckDetail = {
  topic: string;
  claim: string;
  isFactual: boolean;
  correction: string;
  sources?: {
    title: string;
    url: string;
  }[];
};

export type FactCheckParams = {
  prUrl: string;
  credential: string;
};

export type FactCheckResult = {
  success: true;
  commentUrl: string;
};

export type FactCheckErrorResult = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};
