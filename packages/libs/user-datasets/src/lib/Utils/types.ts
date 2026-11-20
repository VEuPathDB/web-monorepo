export type BiConsumer<T1, T2> = (value1: T1, value2: T2) => void;
export type Consumer<T> = (value: T) => void;
export type Function<T, R> = (value: T) => R;
export type Predicate<T> = (value: T) => boolean;
export type Producer<R> = () => R;
export type Runnable = () => void;
export type UnaryFunction<T> = Function<T, T>;

export type Nullable<T> = T | null;
export type Possible<T> = T | undefined;
export type Optional<T> = T | null | undefined;

export type Mutable<T extends object> = {
  -readonly [K in keyof T]: T[K];
};

export type DatasetFileType =
  | 'upload'
  | 'install'
  | 'documents'
  | 'datasetProperties';
