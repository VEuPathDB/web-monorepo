export type AiExpressionSummaryResponse = Record<
  string,
  AiExpressionGeneResponse
>;

type StatusString =
  | 'present'
  | 'missing'
  | 'failed'
  | 'expired'
  | 'corrupted'
  | 'undetermined';

type SummaryStatusString = StatusString | 'experiments_incomplete';

export interface AiExpressionGeneResponse {
  resultStatus: SummaryStatusString;
  numExperiments?: number;
  numExperimentsComplete?: number;
  expressionSummary?: AiExpressionSummary;
}

export interface AiExpressionSummary {
  headline: string;
  one_paragraph_summary: string;
  topics: AiExpressionSummarySection[];
}

export interface AiExpressionSummarySection {
  headline: string;
  one_sentence_summary: string;
  summaries: AiExperimentSummary[];
}

export interface AiExperimentSummary {
  one_sentence_summary: string;
  notes: string;
  confidence: number;
  biological_importance: number;
  dataset_id: string;
  experiment_keywords: string[];
}
