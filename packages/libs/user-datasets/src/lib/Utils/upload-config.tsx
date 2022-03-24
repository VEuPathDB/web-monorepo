import { intersection } from 'lodash';

import { DatasetUploadPageConfig, DatasetUploadTypeConfig } from './types';

export const uploadTypeConfig = {
  biom: {
    type: 'biom',
    uploadTitle: 'Upload My Data Set',
    formConfig: {
      renderInfo: () => (
        <p className="formInfo">
          <span>* </span> All form fields are required.
          <br />
          <br />
          We accept any file in the{' '}
          <a href="http://biom-format.org">BIOM format</a>, either JSON-based
          (BIOM 1.0) or HDF5 (BIOM 2.0+). The maximum allowed file size is 1GB.
          <br />
          <br />
          If possible, try including taxonomic information and rich sample
          details in your file. This will allow you to select groups of samples
          and create meaningful comparisons at a desired aggregation level,
          using our filtering and visualisation tools.
        </p>
      ),
    },
  },
} as const;

export function makeDatasetUploadPageConfig<
  T1 extends string,
  T2 extends string
>(
  availableUploadTypes: T1[] = [],
  uploadTypeConfig: DatasetUploadTypeConfig<T2>
): DatasetUploadPageConfig<T1 & T2, T2> {
  const restrictedUploadTypes = intersection(
    availableUploadTypes,
    Object.keys(uploadTypeConfig)
  ) as (T1 & T2)[];

  return restrictedUploadTypes.length === 0
    ? { hasDirectUpload: false }
    : {
        hasDirectUpload: true,
        availableUploadTypes: restrictedUploadTypes,
        uploadTypeConfig,
      };
}
