import {
  jsx as _jsx,
  jsxs as _jsxs,
  Fragment as _Fragment,
} from 'react/jsx-runtime';
import { intersection } from 'lodash';
export const uploadTypeConfig = {
  biom: {
    type: 'biom',
    uploadTitle: 'Upload My Data Set',
    formConfig: {
      renderInfo: () =>
        _jsxs(
          'p',
          Object.assign(
            { className: 'formInfo' },
            {
              children: [
                'We accept any file in the',
                ' ',
                _jsx(
                  'a',
                  Object.assign(
                    { href: 'http://biom-format.org' },
                    { children: 'BIOM format' }
                  )
                ),
                ', either JSON-based (BIOM 1.0) or HDF5 (BIOM 2.0+). The maximum allowed file size is 1GB.',
                _jsx('br', {}),
                _jsx('br', {}),
                'If possible, try including taxonomic information and rich sample details in your file. This will allow you to select groups of samples and create meaningful comparisons at a desired aggregation level, using our filtering and visualisation tools.',
              ],
            }
          )
        ),
      uploadMethodConfig: {
        file: {
          maxSizeBytes: 1e7,
          render: ({ fieldNode }) =>
            _jsxs(_Fragment, {
              children: [
                fieldNode,
                _jsx(
                  'div',
                  Object.assign(
                    { style: { marginTop: '0.25em' } },
                    { children: 'File must be 10 MB or smaller.' }
                  )
                ),
              ],
            }),
        },
      },
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
          render: ({ fieldNode }) =>
            _jsxs(_Fragment, {
              children: [
                fieldNode,
                _jsx(
                  'div',
                  Object.assign(
                    { style: { marginTop: '0.25em' } },
                    {
                      children:
                        'File must be a .csv, .tsv, or tab-delimited .txt file',
                    }
                  )
                ),
              ],
            }),
        },
        url: {
          offer: false,
        },
      },
    },
  },
};
export function makeDatasetUploadPageConfig(
  availableUploadTypes = [],
  uploadTypeConfig
) {
  const restrictedUploadTypes = intersection(
    availableUploadTypes,
    Object.keys(uploadTypeConfig)
  );
  return restrictedUploadTypes.length === 0
    ? { hasDirectUpload: false }
    : {
        hasDirectUpload: true,
        availableUploadTypes: restrictedUploadTypes,
        uploadTypeConfig,
      };
}
//# sourceMappingURL=upload-config.js.map
