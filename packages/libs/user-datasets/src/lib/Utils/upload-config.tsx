import { intersection } from 'lodash';

import { DatasetUploadPageConfig, DatasetUploadTypeConfig } from './types';

type ImplementedUploadTypes = 'biom' | 'gene-list' | 'isasimple';

export const uploadTypeConfig: DatasetUploadTypeConfig<ImplementedUploadTypes> = {
  biom: {
    type: 'biom',
    uploadTitle: 'Upload My Data Set',
    formConfig: {
      renderInfo: () => (
        <p className="formInfo">
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
      uploadMethodConfig: {},
    },
  },
  'gene-list': {
    type: 'gene-list',
    uploadTitle: 'Upload My Gene List',
    formConfig: {
      uploadMethodConfig: {
        result: {
          offerStrategyUpload: false,
          compatibleRecordTypes: {
            transcript: {
              reportName: 'attributesTabular',
              reportConfig: {
                attributes: ['primary_key'],
                includeHeader: false,
                attachmentType: 'plain',
                applyFilter: true,
              },
            },
          },
        },
      },
    },
  },
  isasimple: {
    type: 'isasimple',
    uploadTitle: 'Upload My Study',
    formConfig: {
      summary: {
        inputProps: {
          placeholder: 'brief summary of the data set in 1-2 sentences',
        },
      },
      description: {
        inputProps: {
          required: false,
          placeholder:
            'optional longer description of the data set including background, study objectives, methodology, etc.',
        },
      },
      uploadMethodConfig: {
        file: {
          render: ({ fieldNode }) => (
            <>
              {fieldNode}
              <div style={{ marginTop: '0.25em' }}>
                File must be a .csv, .tsv, or tab-delimited .txt file
              </div>
            </>
          ),
        },
        url: {
          offer: false,
        },
      },
    },
  },
};

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
