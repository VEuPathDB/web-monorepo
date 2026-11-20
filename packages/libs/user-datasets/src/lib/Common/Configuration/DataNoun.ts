/**
 * In EDA, data is referred to as "Study" or "Studies"
 * In genomics, data is referred to as "Dataset" or "Datasets"
 */
export type DataNoun = {
  readonly singular: string;
  readonly plural: string;
};