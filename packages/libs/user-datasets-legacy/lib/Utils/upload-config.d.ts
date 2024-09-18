import { DatasetUploadPageConfig, DatasetUploadTypeConfig } from './types';
type ImplementedUploadTypes = 'biom' | 'gene-list' | 'isasimple';
export declare const uploadTypeConfig: DatasetUploadTypeConfig<ImplementedUploadTypes>;
export declare function makeDatasetUploadPageConfig<
  T1 extends string,
  T2 extends string
>(
  availableUploadTypes: T1[] | undefined,
  uploadTypeConfig: DatasetUploadTypeConfig<T2>
): DatasetUploadPageConfig<T1 & T2, T2>;
export {};
//# sourceMappingURL=upload-config.d.ts.map
