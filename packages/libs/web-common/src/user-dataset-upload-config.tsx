import {
  DatasetUploadTypeConfig,
  DependencyProps,
} from '@veupathdb/user-datasets/lib/Utils/types';
import { useOrganismTree } from './hooks/organisms';
import { SelectTree } from '@veupathdb/coreui';
import { useCallback, useMemo, useState } from 'react';
import { getLeaves } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { TreeBoxVocabNode } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { useWdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';

type ImplementedUploadTypes =
  | 'biom'
  | 'genelist'
  | 'isasimple'
  | 'bigwigfiles'
  | 'rnaseq';

export const uploadTypeConfig: DatasetUploadTypeConfig<ImplementedUploadTypes> =
  {
    rnaseq: {
      type: 'rnaseq',
      uploadTitle: 'Upload My RNASeq Data Set',
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
            Please upload a zip file with your RNASeq results: your bigWig and
            fpkm fastq files containing your processed reads.
            <br />
            Each file in the collection of FPKM or TPM files should be a two
            column tab-delimited file where the first column contains gene ids,
            and the second column contains normalized counts for each gene,
            either FPKM or TPM. The first line must have column headings
            'gene_id' and either 'FPKM' or 'TMP'.
            <br />
            <br />
            The files must be mapped to the reference genome that you select
            below.
            <br />
            Only letters, numbers, spaces and dashes are allowed in the file
            name.
            <br />
            Please restrict the name to 100 characters or less.
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
    bigwigfiles: {
      type: 'bigwigfiles',
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
            We accept any file in the{' '}
            <a href="https://genome.ucsc.edu/goldenpath/help/bigWig.html">
              bigWig format
            </a>
            .
            <br />
            The bigwig files you select here must be mapped to the reference
            genome that you select below.
            <br />
            Only letters, numbers, spaces and dashes are allowed in the file
            name.
            <br />
            Please restrict the name to 100 characters or less.
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

function ReferenceGenomeDepdency(props: DependencyProps) {
  const { value, onChange } = props;
  const selectedList = value?.map((entry) => entry.resourceIdentifier);
  const organismTree = useOrganismTree(true);
  const leavesByTerm = useMemo(() => {
    const leaves = organismTree
      ? getLeaves(organismTree, (node) => node.children)
      : [];
    return new Map(leaves.map((node) => [node.data.term, node.data]));
  }, [organismTree]);
  const { wdkService } = useWdkDependenciesContext();
  const onSelectionChange = useCallback(
    async function handleChange(selection: string[]) {
      const projectInfo = await wdkService.getConfig();
      const nodes = selection
        .map((term) => leavesByTerm.get(term))
        .filter((node): node is TreeBoxVocabNode['data'] => node != null);
      const dependencies = nodes.map((node) => ({
        resourceDisplayName: node.display,
        resourceIdentifier: node.term,
        resourceVersion: projectInfo.buildNumber,
      }));
      onChange(dependencies);
    },
    [leavesByTerm, onChange, wdkService]
  );
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  if (organismTree == null) return null;
  return (
    <SelectTree
      buttonDisplayContent="Choose reference genome"
      tree={organismTree}
      getNodeId={(node) => node.data.term}
      getNodeChildren={(node) => node.children}
      onExpansionChange={setExpandedNodes}
      expandedList={expandedNodes}
      isMultiPick={false}
      isSearchable
      searchTerm={searchTerm}
      onSearchTermChange={setSearchTerm}
      searchPredicate={(node, terms) =>
        terms.some((term) =>
          node.data.display.toLowerCase().includes(term.toLowerCase())
        )
      }
      isSelectable
      selectedList={selectedList}
      onSelectionChange={onSelectionChange}
      linksPosition={SelectTree.LinkPlacement.Top}
      styleOverrides={{
        treeNode: {
          labelTextWrapper: {
            fontSize: '1.1em',
          },
        },
      }}
    />
  );
}
