import { useOrganismTree } from './hooks/organisms';
import { SelectTree } from '@veupathdb/coreui';
import React, { ReactElement, useCallback, useState } from 'react';
import { projectId } from './config';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { TreeBoxVocabNode } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { Node } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { areTermsInString } from '@veupathdb/wdk-client/lib/Utils/SearchUtils';
import {
  ClientDatasetTypeConfig,
  DatasetDependency,
  DependencyInputProps,
  UploadFormConfigurators,
} from '@veupathdb/user-datasets/lib';
import { Link } from 'react-router-dom';
import { useRouteMatch } from 'react-router-dom';
import { DatasetTypeConfig, DatasetUploadConfig } from '@veupathdb/user-datasets/lib/Components/Upload';

/**
 * Type identifiers for dataset types that have client handling.
 */
const implementedUploadTypes = {
  biom: { name: 'biom', version: '1.0' },
  genelist: { name: 'genelist', version: '1.0' },
  isasimple: { name: 'isasimple', version: '1.0' },
  bigwigfiles: { name: 'bigwigfiles', version: '1.0' },
  rnaseq: { name: 'rnaseq', version: '1.0' },
  phenotype: { name: 'phenotype', version: '1.0' },
};

/**
 * Basic dataset type configurations.
 *
 * Primarily used for rendering the data type selection menu before the upload
 * form for projects that allow for multiple dataset types.
 */
export const userDatasetTypeConfigs: readonly ClientDatasetTypeConfig[] = [
  {
    ...implementedUploadTypes.bigwigfiles,
    description: `Integrate your bigWig data in ${projectId}.`,
  },
  {
    ...implementedUploadTypes.biom,
    description: `Integrate your BIOM study data in ${projectId}.`,
  },
  {
    ...implementedUploadTypes.genelist,
    description: `Integrate your gene list in ${projectId}.`,
  },
  {
    ...implementedUploadTypes.isasimple,
    description: `Integrate your study data in ${projectId}.`,
  },
  {
    ...implementedUploadTypes.phenotype,
    description: `Integrate your Phenotype data in ${projectId}.`,
  },
  {
    ...implementedUploadTypes.rnaseq,
    description: `Integrate your Normalized RNA-Seq data in ${projectId}.`,
  },
];

/**
 * Dataset type specific upload form configuration constructors.
 *
 * One should exist for every dataset type that users can upload.
 */
export const uploadFormConfigurators: UploadFormConfigurators = [
  // bigwig
  [ implementedUploadTypes.bigwigfiles, bigwigFormConfigurator ],

  // biom
  [ implementedUploadTypes.biom, biomFormConfigurator ],

  // genelist
  [ implementedUploadTypes.genelist, genelistFormConfigurator ],

  // isasimple
  [ implementedUploadTypes.isasimple, isasimpleFormConfigurator ],

  // phenotype
  [ implementedUploadTypes.phenotype, phenotypeFormConfigurator ],

  // rnaseq
  [ implementedUploadTypes.rnaseq, rnaseqFormConfigurator ],
];

const DefaultFormTitle = 'Upload Dataset';

const StudyDesignVocab: readonly [string, string][] = [
  ['Cluster-randomized controlled trial', 'Experimental'],
  ['Quasi-experimental study', 'Experimental'],
  ['Randomized controlled/clinical trial', 'Experimental'],

  ['Case series study', 'Observational'],
  ['Case-control study', 'Observational'],
  ['Cohort study', 'Observational'],
  ['Cross-sectional study', 'Observational'],
  ['Ecological study', 'Observational'],
  ['Panel study', 'Observational'],
  ['Surveillance study', 'Observational'],

  ['Meta-analysis', 'Review'],

  ['Other', 'n/a'],
];

function bigwigFormConfigurator(dataType: DatasetTypeConfig): DatasetUploadConfig {
  return {
    dataType,
    verbiage: {
      formTitle: DefaultFormTitle,
    },
    dataInputConfig: {
      file: { enabled: true },
      helpText: () => (
        <div className="formInfo">
          <p>
            We accept .bw or .bigwig files in the{' '}
            <a href="https://genome.ucsc.edu/goldenpath/help/bigWig.html">
              bigWig format
            </a>
            .
            <br />
            If you need to upload more than one file please make a compressed
            file with all your bigWig files (a .tar.gz, .tgz or .zip file).
          </p>
          <ul>
            <li>
              Each bigWig file must be mapped to the genome that you selected
              above.
            </li>
          </ul>
        </div>
      ),
    },
    dependencies: {
      required: true,
      renderInput: ReferenceGenomeDependency,
    },
    datasetCharacteristics: {
      enable: true,
      studyDesignVocab: StudyDesignVocab,
    },
  };
}

function biomFormConfigurator(dataType: DatasetTypeConfig): DatasetUploadConfig {
  return {
    dataType,
    verbiage: {
      formTitle: DefaultFormTitle,
    },
    dataInputConfig: {
      file: { enabled: true },
      helpText: () => (
        <p className="formInfo">
          We accept any file in the{' '}
          <a href="http://biom-format.org">BIOM format</a>, either JSON-based
          (BIOM 1.0) or HDF5 (BIOM 2.0+).
          <br />
          <br />
          If possible, try including taxonomic information and rich sample
          details in your file. This will allow you to select groups of samples
          and create meaningful comparisons at a desired aggregation level,
          using our filtering and visualisation tools.
        </p>
      ),
    },
    datasetCharacteristics: {
      enable: true,
      studyDesignVocab: StudyDesignVocab,
    },
  };
}

function genelistFormConfigurator(dataType: DatasetTypeConfig): DatasetUploadConfig {
  return {
    dataType,
    verbiage: {
      formTitle: DefaultFormTitle,
    },
    datasetCharacteristics: {
      enable: true,
      studyDesignVocab: StudyDesignVocab,
    },
    dataInputConfig: {
      file: {
        enabled: true,
        helpText: (
          <div style={{ marginTop: '0.25em' }}>
            File must be a text, comma or tab-delimited .txt, .csv or .tsv
            file.
          </div>
        ),
      },
      result: {
        enabled: true,
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
      helpText: () => (
        <div className="formInfo">
          <p>
            Upload a file containing gene IDs. Gene IDs need to be valid and be
            separated by valid delimiters.
          </p>
          Valid gene IDs should:
          <ul>
            <li>include only these characters [a-zA-Z0-9().:_-]</li>
            <li>have at least one alphabetical character</li>
            <li>be at most 80 characters</li>
          </ul>
          <p>Invalid IDs and duplicated IDs will be discarded.</p>
          Valid delimiters are:
          <ul>
            <li>white space (newline, space, tab)</li>
            <li>comma</li>
            <li>semi-colon</li>
          </ul>
          <p>
            <i>
              Gene lists can also be added from a search strategy result page:
              click on the "Send to" menu near the "Download" button, and choose
              the "My Datasets" option to install the gene list in My Datasets.
            </i>
          </p>
        </div>
      ),
    },
  };
}

function isasimpleFormConfigurator(dataType: DatasetTypeConfig): DatasetUploadConfig {
  return {
    dataType,
    verbiage: {
      formTitle: DefaultFormTitle,
      formInputs: {
        datasetProperties: {
          label: 'Variable Attributes',
          helpText: function HelpText() {
            const { path } = useRouteMatch();
            return (
              <div className="formInfo">
                <p>
                  (Optional) Upload a variable annotations file describing the
                  variables in the data file:
                </p>
                <ul>
                  <li>in .csv, .tsv, or tab-delimited .txt format</li>
                  <li>
                    with columns labeled (i) variable; (ii) label; (iii)
                    definition, and
                  </li>
                  <li>with one row for every variable in the data file</li>
                </ul>
                <p className="red">
                  A valid variable annotations file is required to grant
                  <i>Community Access</i> to the dataset.
                </p>
                <p>
                  <i>
                    See <Link to={path + '/help'}>My datasets help</Link> for
                    more information on how to properly format your files for
                    upload.
                  </i>
                </p>
              </div>
            );
          },
        },
      },
    },
    datasetCharacteristics: {
      enable: true,
      studyDesignVocab: StudyDesignVocab,
    },
    dataInputConfig: {
      file: {
        enabled: true,
        helpText: (
          <div style={{ marginTop: '0.25em' }}>
            File must be a .csv, .tsv, or tab-delimited .txt file
          </div>
        ),
      },
    },
  };
}

function phenotypeFormConfigurator(dataType: DatasetTypeConfig): DatasetUploadConfig {
  return {
    dataType,
    verbiage: {
      formTitle: DefaultFormTitle,
    },
    datasetCharacteristics: {
      enable: true,
      studyDesignVocab: StudyDesignVocab,
    },
    dataInputConfig: {
      file: {
        enabled: true,
        helpText: (
          <div style={{ marginTop: '0.25em' }}>
            File must be a tab-delimited .txt or .tsv file.
          </div>
        ),
      },
    },
  };
}

function rnaseqFormConfigurator(dataType: DatasetTypeConfig): DatasetUploadConfig {
  return {
    dataType,
    verbiage: {
      formTitle: DefaultFormTitle,
    },
    dataInputConfig: {
      file: { enabled: true },
      helpText: () => (
        <div className="formInfo">
          To upload your dataset:
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
                  strandedness ('unstranded' or 'stranded') - Only 'unstranded'
                  is currently supported.
                </li>
              </ul>
            </li>
          </ol>
          Optionally, you may include <b>bigWig files</b> (.bw extension) in
          your compressed file:
          <ol>
            <li>
              they are not required but will allow visualization in the genome
              browser.
            </li>
            <li>add these file names in the manifest file.</li>
            <li>make sure there are no empty files.</li>
          </ol>
        </div>
      ),
    },
    dependencies: {
      required: true,
      renderInput: ReferenceGenomeDependency,
    },
    datasetCharacteristics: {
      enable: true,
      studyDesignVocab: StudyDesignVocab,
    },
  };
}

function ReferenceGenomeDependency({
  dependencies,
  setDependencies,
}: DependencyInputProps): ReactElement | null {
  const styleOverrides = {
    treeNode: {
      labelTextWrapper: {
        fontSize: '1.1em',
      },
    },
  };

  const selectedList = dependencies?.map((entry) => entry.resourceDisplayName);

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
        .filter((dep): dep is DatasetDependency => dep != null);
      setDependencies(dependencies);
    },
    [buildNumber, fileNameByTerm, setDependencies]
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
