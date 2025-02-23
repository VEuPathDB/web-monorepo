export type AiExpressionSummaryResponse = Record<
  string,
  AiExpressionGeneResponse
>;

export interface AiExpressionGeneResponse {
  cacheStatus: 'hit' | 'miss';
  reason?: string; // only for misses
  expressionSummary: AiExpressionSummary;
}

export interface AiExpressionSummary {
  headline: string;
  one_paragraph_summary: string;
  sections: AiExpressionSummarySection[];
}

interface AiExpressionSummarySection {
  headline: string;
  one_sentence_summary: string;
  dataset_ids: string[];
}
