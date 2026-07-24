export type BiConsumer<T1, T2> = (value1: T1, value2: T2) => void;
export type Producer<R> = () => R;
export type Consumer<T> = (value: T) => void;
export type Function<T, R> = (value: T) => R;
export type Runnable = () => void;
export type UnaryFunction<T> = Function<T, T>;

export type Nullable<T> = T | null;

export type ArrayElement<A extends any[]> = A extends (infer V)[] ? V : never;

export type Mutable<T extends object> = {
  -readonly [K in keyof T]: T[K];
};

export type DatasetFileType =
  | 'upload'
  | 'install'
  | 'documents'
  | 'datasetProperties';

////////////////////////////////////////////////////////////////////////////////

export interface UserDatasetUpload {
  id: string;
  datasetId?: number;
  datasetName: string;
  summary?: string;
  description?: string;
  projects: string[];
  status: string;
  errors: string[];
  stepPercent?: number;
  started: string;
  finished?: string;
  isOngoing: boolean;
  isCancellable: boolean;
  isSuccessful: boolean;
  isUserError: boolean;
}

/**
 * In EDA, data is referred to as "Study" or "Studies"
 * In genomics, data is referred to as "Dataset" or "Datasets"
 */
export type DataNoun = {
  singular: string;
  plural: string;
};
