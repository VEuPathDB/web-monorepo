export interface AiExpressionSummaryResponse {
  headline: string;
  one_paragraph_summary: string;
  sections: AiExpressionSummarySection[];
}

interface AiExpressionSummarySection {
  headline: string;
  one_sentence_summary: string;
  dataset_ids: string[];
}
