import {
  DatasetUploadTypeConfig,
  DependencyProps,
  UserDataset,
} from '@veupathdb/user-datasets/lib/Utils/types';
import { useOrganismTree } from './organisms';
import { SelectTree } from '@veupathdb/coreui';
import { useCallback, useState } from 'react';
import { projectId } from './config';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { TreeBoxVocabNode } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { Node } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { areTermsInString } from '@veupathdb/wdk-client/lib/Utils/SearchUtils';

type ImplementedUploadTypes =
  | 'biom'
  | 'genelist'
  | 'isasimple'
  | 'bigwigfiles'
  | 'rnaseq'
  | 'wrangler';

export const uploadTypeConfig: DatasetUploadTypeConfig<ImplementedUploadTypes> =
  {
    rnaseq: {
      type: 'rnaseq',
      displayName: 'Normalized RNA-Seq',
      description: `Integrate your Normalized RNA-Seq data in ${projectId}.`,
      uploadTitle: 'Upload My Normalized RNA-Seq Data Set',
      formConfig: {
        summary: {
          inputProps: {
            placeholder: 'brief summary of the study in a few sentences',
          },
        },
        description: {
          inputProps: {
            required: false,
            placeholder: 'optional longer description of the summary',
          },
        },
        dependencies: {
          label: 'Reference Genome',
          required: true,
          render: (props) => <ReferenceGenomeDepdency {...props} />,
        },
        renderInfo: () => (
          <p className="formInfo">
            <b>Upload your Normalized RNA-Seq data set</b>
            <br />
            <br />
            To upload your data set:
            <ol>
              <li>compress the files into a .tar.gz, .tgz or .zip file.</li>
              <li>compress the set of files, not a folder containing them.</li>
              <li>make sure there are no empty files.</li>
            </ol>
            The upload requires:
            <ol>
              <li>
                <b>a counts file per sample</b> - each sample must have only one
                tab-delimited file (use extension .txt) containing two columns
                with these headers:
                <ul>
                  <li>'gene_id'</li>
                  <li>'FPKM' or 'TPM'</li>
                </ul>
              </li>
              <li>
                <b>a manifest file</b> - a tab-delimited file named
                'manifest.txt', containing three columns without headers:
                <ul>
                  <li>sample name</li>
                  <li>file name (must match a counts file)</li>
                  <li>
                    strandedness ('unstranded' or 'stranded') - Only
                    'unstranded' is currently supported.
                  </li>
                </ul>
              </li>
            </ol>
            Optionally, you may include <b>bigWig files</b> (.bw extension) in
            your comprresed file:
            <ol>
              <li>
                they are not required but will allow visualization in the genome
                browser.
              </li>
              <li>add these file names in the manifest file.</li>
              <li>make sure there are no empty files.</li>
            </ol>
          </p>
        ),
        uploadMethodConfig: {
          file: {
            maxSizeBytes: 10 * 1000 * 1000 * 1000, // 10GB
            render: ({ fieldNode }) => (
              <>
                {fieldNode}
                <div style={{ marginTop: '0.25em' }}>
                  File must be less than 10GB
                </div>
              </>
            ),
          },
        },
      },
    },
    bigwigfiles: {
      type: 'bigwigfiles',
      displayName: 'bigWig',
      description: `Integrate your bigWig data in ${projectId}.`,
      uploadTitle: 'Upload My bigWig Data Set',
      formConfig: {
        summary: {
          inputProps: {
            placeholder: 'brief summary in a few sentences',
          },
        },
        description: {
          inputProps: {
            required: false,
            placeholder: 'optional longer description of the summary.',
          },
        },
        dependencies: {
          label: 'Reference Genome',
          required: true,
          render: (props) => <ReferenceGenomeDepdency {...props} />,
        },
        renderInfo: () => (
          <p className="formInfo">
            We accept .bw files in the{' '}
            <a href="https://genome.ucsc.edu/goldenpath/help/bigWig.html">
              bigWig format
            </a>
            .
            <br />
            If you need to upload more than one file please make a compressed
            file with all your bigWig files (a .tar.gz, .tgz or .zip file).
            <ul>
              <li>
                Each bigWig file must be mapped to the genome that you selected
                above.
              </li>
              <li>Each individual file cannot be &gt; 500MB.</li>
              <li>
                Please restrict the .bw file names to &lt; 100 chars and use
                only letters, numbers, spaces and dashes.
              </li>
            </ul>
          </p>
        ),
        uploadMethodConfig: {
          file: {
            maxSizeBytes: 10 * 1000 * 1000 * 1000, // 10GB
            render: ({ fieldNode }) => (
              <>
                {fieldNode}
                <div style={{ marginTop: '0.25em' }}>
                  File must be less than 10GB
                </div>
              </>
            ),
          },
        },
      },
    },
    biom: {
      type: 'biom',
      displayName: 'BIOM',
      description: `Integrate your BIOM study data in ${projectId}.`,
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
      displayName: 'Gene List',
      description: `Integrate your gene list in ${projectId}.`,
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
    wrangler: {
      type: 'wrangler',
      displayName: 'Phenotype',
      description: `Integrate your Phenotype data in ${projectId}.`,
      uploadTitle: 'Upload My Phenotype data set',
      formConfig: {
        summary: {
          inputProps: {
            placeholder: 'brief summary in a few sentences',
          },
        },
        description: {
          inputProps: {
            required: false,
            placeholder: 'optional longer description of the summary.',
          },
        },
        renderInfo: () => (
          <p className="formInfo">
            Upload your phenotype data in a tab delimited file.
            <br />
            The file name should be &lt; 100 chars and use only letters,
            numbers, spaces and dashes.
            <br />
            The file should contain:
            <ul>
              <li>Meaningful column headers</li>
              <li>A gene Id column with header "Gene ID"</li>
              <li>
                Valid gene Ids should:
                <ul>
                  <li>include only these charatacers [a-zA-Z0-9().:_-]*$</li>
                  <li>have at least one alphabetical character</li>
                  <li>be at most 40 characters</li>
                </ul>
              </li>
            </ul>
            Rows with invalid IDs will be discarded.
          </p>
        ),
        uploadMethodConfig: {
          file: {
            maxSizeBytes: 10 * 1000 * 1000 * 1000, // 10GB
            render: ({ fieldNode }) => (
              <>
                {fieldNode}
                <div style={{ marginTop: '0.25em' }}>
                  File must be a tab-delimited .txt file File must be less than
                  xxGB
                </div>
              </>
            ),
          },
        },
      },
    },
    isasimple: {
      type: 'isasimple',
      displayName: 'ISA Study',
      description: `Integrate your study data in ${projectId}.`,
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

const styleOverrides = {
  treeNode: {
    labelTextWrapper: {
      fontSize: '1.1em',
    },
  },
};

function ReferenceGenomeDepdency(props: DependencyProps) {
  const { value, onChange } = props;
  const selectedList = value?.map((entry) => entry.resourceDisplayName);
  const organismTree = useOrganismTree(true);
  const fileNameByTerm = useWdkService(async (wdkService) => {
    const genomeDataTypesResult = await wdkService.getAnswerJson(
      {
        searchName: 'GenomeDataTypes',
        searchConfig: { parameters: {} },
      },
      {
        attributes: ['organism_full', 'name_for_filenames'],
        pagination: {
          numRecords: -1,
          offset: 0,
        },
      }
    );
    return new Map(
      genomeDataTypesResult.records.map((rec) => [
        rec.attributes.organism_full as string,
        rec.attributes.name_for_filenames as string,
      ])
    );
  }, []);
  const buildNumber = useWdkService(async (wdkService) => {
    const config = await wdkService.getConfig();
    return config.buildNumber;
  }, []);
  const onSelectionChange = useCallback(
    function handleChange(selection: string[]) {
      if (fileNameByTerm == null || buildNumber == null) return;
      const dependencies = selection
        .map((term) => {
          const fileName = fileNameByTerm.get(term);
          return fileName == null
            ? undefined
            : {
                resourceDisplayName: term,
                resourceIdentifier: `${projectId}-${buildNumber}_${fileName}_Genome`,
                resourceVersion: buildNumber,
              };
        })
        .filter((dep) => dep != null) as UserDataset['dependencies'];
      onChange(dependencies);
    },
    [buildNumber, fileNameByTerm, onChange]
  );
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  if (organismTree == null) return null;
  return (
    <SelectTree
      shouldCloseOnSelection
      buttonDisplayContent="Choose reference genome"
      tree={organismTree}
      getNodeId={getNodeId}
      getNodeChildren={getNodeChildren}
      onExpansionChange={setExpandedNodes}
      expandedList={expandedNodes}
      isMultiPick={false}
      isSearchable
      searchTerm={searchTerm}
      onSearchTermChange={setSearchTerm}
      searchPredicate={searchPredicate}
      isSelectable
      selectedList={selectedList}
      onSelectionChange={onSelectionChange}
      linksPosition={SelectTree.LinkPlacement.Top}
      styleOverrides={styleOverrides}
    />
  );
}

function getNodeId(node: Node<TreeBoxVocabNode>) {
  return node.data.term;
}
function getNodeChildren(node: Node<TreeBoxVocabNode>) {
  return node.children;
}
function searchPredicate(node: Node<TreeBoxVocabNode>, terms: string[]) {
  return areTermsInString(terms, node.data.display);
}
