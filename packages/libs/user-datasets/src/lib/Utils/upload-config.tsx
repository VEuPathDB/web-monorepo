import { intersection } from 'lodash';

import { DatasetUploadPageConfig, DatasetUploadTypeConfig } from './types';

type ImplementedUploadTypes = 'biom' | 'genelist' | 'isasimple';

export const uploadTypeConfig: DatasetUploadTypeConfig<ImplementedUploadTypes> =
  {
    biom: {
      type: 'biom',
      uploadTitle: 'Upload My Data Set',
      formConfig: {
        summary: {
          inputProps: {
            placeholder: 'brief summary of the study in a few sentences',
          },
        },
        description: {
          inputProps: {
            required: false,
            placeholder:
              'optional longer description of the summary including background, study objectives, methodology, etc.',
          },
        },
        renderInfo: () => (
          <p className="formInfo">
            We accept any file in the{' '}
            <a href="http://biom-format.org">BIOM format</a>, either JSON-based
            (BIOM 1.0) or HDF5 (BIOM 2.0+).
            <br />
            <br />
            If possible, try including taxonomic information and rich sample
            details in your file. This will allow you to select groups of
            samples and create meaningful comparisons at a desired aggregation
            level, using our filtering and visualisation tools.
          </p>
        ),
        uploadMethodConfig: {
          file: {
            maxSizeBytes: 100 * 1000 * 1000, // 100MB
            render: ({ fieldNode }) => (
              <>
                {fieldNode}
                <div style={{ marginTop: '0.25em' }}>
                  File must be less than 100MB
                </div>
              </>
            ),
          },
        },
      },
    },
    genelist: {
      type: 'genelist',
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
            placeholder: 'brief summary of the study in a few sentences',
          },
        },
        description: {
          inputProps: {
            required: false,
            placeholder:
              'optional longer description of the study including background, study objectives, methodology, etc.',
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
