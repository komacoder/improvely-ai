export enum IELTSWritingSubmissionType {
  Task1 = 'Task 1',
  Task2 = 'Task 2',
}

export enum IELTSWritingSubmissionStatus {
  IDLE = 'IDLE',
  IN_PROGRESS = 'IN_PROGRESS',
  ANALYZED = 'ANALYZED',
  FAILED_TO_CHECK = 'FAILED_TO_CHECK',
}

export enum IELTSWritingTopicEnum {
  GENERATED = 'GENERATED',
  CUSTOM = 'CUSTOM',
}

export enum IELTSWritingTargetScore {
  BAND_SEVEN = 'BAND_SEVEN',
  BAND_EIGHT = 'BAND_EIGHT',
  BAND_NINE = 'BAND_NINE',
}

export interface ImprovedVersion {
  introduction: string;
  body: string[];
  conclusion: string;
  criteriaResponse: {
    taskResponse: string;
    coherence: string;
    lexical: string;
    grammar: string;
  };
}

export interface InlineFeedback {
  originalText: string;
  startIndex: number;
  endIndex: number;
  category: string;
  explanation: string;
  suggestion: string;
  suggestionExplanation: string;
}

export interface Submission {
  _id: string;
  body: string;
  status: IELTSWritingSubmissionStatus;
  topic: IELTSWritingTopicEnum;
  targetScore: IELTSWritingTargetScore;
  score: number;
  aiFeedback: {
    mistakes: string[];
    suggestions: string[];
    inlineFeedback?: InlineFeedback[];
    improvedVersions?: {
      band7: ImprovedVersion;
      band8: ImprovedVersion;
      band9: ImprovedVersion;
    };
  };
  createdAt: string;
  updatedAt: string;
  criteriaScores?: {
    taskResponse: number;
    coherence: number;
    lexical: number;
    grammar: number;
  };
  // Separate field for improved versions from the second API call
  improvedVersion?: {
    band7: ImprovedVersion;
    band8: ImprovedVersion;
    band9: ImprovedVersion;
  };
}
