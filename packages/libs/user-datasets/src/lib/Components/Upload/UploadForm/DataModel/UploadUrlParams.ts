export type UploadUrlParams = {
  readonly datasetStepId?: string
  readonly datasetStrategyRootStepId?: string;
  readonly datasetUrl?: string;
} & Record<string, string>;
