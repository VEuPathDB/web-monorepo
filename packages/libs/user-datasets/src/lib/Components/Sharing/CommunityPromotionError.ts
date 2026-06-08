/**
 * Represents one or more errors that were encountered while attempting to
 * promote one or more datasets to community datasets.
 */
export interface CommunityPromotionError {
  /**
   * Client-side exception message.
   */
  readonly clientError?: string;

  /**
   * Misc service errors that are unrelated to dataset state validation.
   */
  readonly serviceErrors?: readonly string[];

  /**
   * Validation error messages.
   */
  readonly validationErrors?: readonly CommunityPromotionValidationError[];
}

export interface CommunityPromotionValidationError {
  readonly datasetId: string;
  readonly general: readonly string[];
  readonly byField: Record<string, readonly string[]>;
}