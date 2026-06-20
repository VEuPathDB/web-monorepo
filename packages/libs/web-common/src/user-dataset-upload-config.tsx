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
import { useRouteMatch } from 'react-router-dom';
import {
  DatasetTypeConfig,
  DatasetUploadConfig,
} from '@veupathdb/user-datasets/lib/Components/Upload';
import { formatFileSize } from '@veupathdb/user-datasets/lib/Utils/formatting';
import { SelectTreeStyleSpec } from '@veupathdb/coreui/lib/components/inputs/SelectTree/SelectTree';
import {
  ButtonStateStyleSpec,
  PartialButtonStyleSpec,
} from '@veupathdb/coreui/lib/components/buttons';

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
 * Each entry in the following array should be a tuple of dataset type
 * identifier and type-specific form config constructor.
 *
 * One should exist for every dataset type that users can upload on any site,
 * the entries will be filtered by site at a later point based on the VDI
 * service configuration.
 */
export const uploadFormConfigurators: UploadFormConfigurators = [
  // bigwig
  [implementedUploadTypes.bigwigfiles, bigwigFormConfigurator],

  // biom
  [implementedUploadTypes.biom, biomFormConfigurator],

  // genelist
  [implementedUploadTypes.genelist, genelistFormConfigurator],

  // isasimple
  [implementedUploadTypes.isasimple, isasimpleFormConfigurator],

  // phenotype
  [implementedUploadTypes.phenotype, phenotypeFormConfigurator],

  // rnaseq
  [implementedUploadTypes.rnaseq, rnaseqFormConfigurator],
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

const wranglerDataHelp = (
  <div>
    <p>
      Column names must be unique, cannot contain newlines, but can contain
      spaces.
    </p>
    <p>We will consider a column:</p>
    <ul>
      <li>a date, if their values follow the pattern YYYY-MM-DD;</li>
      <li>
        geographical longitude, latitude, if their column names are: latitude,
        lat, longitude, long (case insensitive);
      </li>
      <li>
        numeric when all values are numbers:
        <ul>
          <li>Use a dot for decimals; commas will be removed.</li>
          <li>Scientific format is allowed.</li>
        </ul>
      </li>
    </ul>
  </div>
);
const wranglerVarAttrHelp = (
  <div>
    <p>
      (Optional) Upload a variable attributes file describing the variables in
      the data file:
    </p>
    <ul>
      <li>in .csv, .tsv, or tab-delimited .txt format,</li>
      <li>
        with columns labeled (i) variable; (ii) label; (iii) definition, and
      </li>
      <li>with one row for every variable in the data file.</li>
    </ul>
    <p className="important-info-bold">
      A valid variable attributes file is required to make your dataset Public.
    </p>
  </div>
);
const textFilesHelp = (
  <p>
    <i>
      To prevent accented letters and other special characters from displaying
      incorrectly, text files should use UTF-8 encoding (recommended). UTF-16BE,
      UTF-16LE, ISO-8859-1 and Windows-1252 are also supported.
    </i>
  </p>
);

function bigwigFormConfigurator(
  dataType: DatasetTypeConfig
): DatasetUploadConfig {
  return {
    dataType,
    verbiage: {
      formTitle: `Upload a ${dataType.vdiConfig.category} Dataset`,
    },
    dataInputConfig: {
      file: {
        enabled: true,
        helpText: (
          <div>Total uncompresssed files cannot be greater than 1GB.</div>
        ),
      },
      helpText: () => (
        <div className="formInfo">
          <p>
            We accept .bw or .bigwig files in the{' '}
            <a href="https://genome.ucsc.edu/goldenpath/help/bigWig.html">
              bigWig format
            </a>
            . If you need to upload more than one file please make a compressed
            file with all your bigWig files (a .tar.gz, .tgz or .zip file).
          </p>
          <ul>
            <li>
              Each bigWig file must be mapped to the genome that you selected
              above.
            </li>
            <li>Each bigWig file cannot be &gt; 500MB.</li>
          </ul>
        </div>
      ),
    },
    dependencies: {
      required: true,
      renderInput: ReferenceGenomeDependency,
    },
    enableExperimentalOrganism: true,
  };
}

function biomFormConfigurator(
  dataType: DatasetTypeConfig
): DatasetUploadConfig {
  return {
    dataType,
    verbiage: {
      formTitle: `Upload a ${dataType.vdiConfig.category} Dataset`,
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

function genelistFormConfigurator(
  dataType: DatasetTypeConfig
): DatasetUploadConfig {
  return {
    dataType,
    verbiage: {
      formTitle: `Upload a ${dataType.vdiConfig.category} Dataset`,
    },
    enableExperimentalOrganism: true,
    dataInputConfig: {
      file: { enabled: true },
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
          <p>Valid gene IDs should:</p>
          <ul>
            <li>include only these characters [a-zA-Z0-9().:_-],</li>
            <li>have at least one alphabetical character, and</li>
            <li>be at most 80 characters.</li>
          </ul>
          <p>Invalid IDs and duplicated IDs will be discarded.</p>
          <p>Valid delimiters are:</p>
          <ul>
            <li>white space (newline, space, tab),</li>
            <li>comma, and </li>
            <li>semi-colon.</li>
          </ul>
          <p>
            <i>
              Gene lists can also be added from a search strategy results
              section: click on the "Send to" menu near the "Download" button,
              and choose the "My Datasets" option to install the gene list in My
              Datasets.
            </i>
          </p>
          {textFilesHelp}
        </div>
      ),
    },
  };
}

function isasimpleFormConfigurator(
  dataType: DatasetTypeConfig
): DatasetUploadConfig {
  return {
    dataType,
    verbiage: {
      formTitle: DefaultFormTitle,
      formInputs: {
        datasetProperties: {
          label: 'Variable Attributes File',
          helpText: function HelpText() {
            const { path } = useRouteMatch();
            return <div className="formInfo">{wranglerVarAttrHelp}</div>;
          },
        },
      },
    },
    datasetCharacteristics: {
      enable: true,
      studyDesignVocab: StudyDesignVocab,
    },
    dataInputConfig: {
      file: { enabled: true },
      helpText: () => (
        <div className="formInfo">
          <p>
            Upload a single data file in .csv, .tsv, or tab-delimited .txt
            format. Compressed (.zip) files are also supported.
          </p>
          <ul>
            <li>Have variables as columns, records as rows.</li>
            <li>The first row must be column names (= variable names).</li>
          </ul>
          {wranglerDataHelp}
          {textFilesHelp}
        </div>
      ),
    },
  };
}

function phenotypeFormConfigurator(
  dataType: DatasetTypeConfig
): DatasetUploadConfig {
  return {
    dataType,
    verbiage: {
      formTitle: `Upload a ${dataType.vdiConfig.category} Dataset`,
      formInputs: {
        datasetProperties: {
          label: 'Variable Attributes File',
          helpText: function HelpText() {
            const { path } = useRouteMatch();
            return <div className="formInfo">{wranglerVarAttrHelp}</div>;
          },
        },
      },
    },
    enableExperimentalOrganism: true,
    dataInputConfig: {
      file: { enabled: true },
      helpText: () => (
        <div className="formInfo">
          <p>Upload a tab-delimited .txt file. The file should contain:</p>
          <ul>
            <li>a gene ID column with header "geneID", and</li>
            <li>at least one numeric column.</li>
          </ul>
          <p>The file will be rejected if there are duplicated IDs.</p>
          <p>Invalid IDs will be discarded. Valid gene IDs:</p>
          <ul>
            <li>include only these characters [a-zA-Z0-9().:_-],</li>
            <li>have at least one alphabetical character, and</li>
            <li>are at most 80 characters.</li>
          </ul>
          {wranglerDataHelp}
          {textFilesHelp}
        </div>
      ),
    },
  };
}

function rnaseqFormConfigurator(
  dataType: DatasetTypeConfig
): DatasetUploadConfig {
  return {
    dataType,
    verbiage: {
      formTitle: `Upload a ${dataType.vdiConfig.category} Dataset`,
    },
    dataInputConfig: {
      file: {
        enabled: true,
        helpText: (
          <div>Total uncompresssed files cannot be greater than 1GB.</div>
        ),
      },
      helpText: () => (
        <details
          style={{
            border: '1px solid #ccc',
            padding: '10px',
            borderRadius: '4px',
          }}
        >
          <summary style={{ fontWeight: 'bold', cursor: 'pointer' }}>
            Instructions to upload your RNA-Seq dataset
          </summary>
          <div style={{ marginTop: '10px' }}>
            <div className="formInfo">
              <p>Prepare your data for upload:</p>
              <ul>
                <li>
                  Compress the files into a .tar.gz, .tgz or .zip archive file.
                </li>
                <li>
                  Add files directly to the archive (do not place them in a
                  folder before archiving).
                </li>
                <li>Ensure all files are non-empty.</li>
                <li>
                  Files saved on some Windows editors may have incompatible line
                  endings; before zipping, open each file in a text editor like
                  Notepad++ and convert line endings to Unix format.
                </li>
              </ul>
              <p>Include the following files in your archive:</p>
              <ol>
                <li>
                  <b>Counts files</b> <i>(required)</i>
                  <ul>
                    <li>Provide one tab-delimited .txt file per sample.</li>
                    <li>
                      Each file must provide exactly two columns, labeled:
                      <ul>
                        <li>'gene_id', and</li>
                        <li>'FPKM' or 'TPM'.</li>
                      </ul>
                    </li>
                    <li>
                      Gene IDs need to be valid VEuPathDB IDs; transcript IDs
                      will not install properly. There cannot be duplicates.
                    </li>
                    <li>
                      All values in the counts column must be floating point:
                      use 0.0, not 0; use 22.0, not 22.
                    </li>
                  </ul>
                </li>
                <li>
                  <b>Manifest file</b>i <i>(required)</i>
                  <ul>
                    <li>Provide a tab-delimited file named 'manifest.txt'.</li>
                    <li>
                      Include three or four unlabeled columns in this order:
                      <ul>
                        <li>sample name (avoid spaces),</li>
                        <li>counts file name (must match exactly),</li>
                        <li>
                          strandedness ('unstranded' or 'stranded'),{' '}
                          <i>(only 'unstranded' is currently supported.)</i>,
                          and
                        </li>
                        <li>
                          bigwig file name (optional, must match exactly if
                          provided).
                        </li>
                      </ul>
                    </li>
                  </ul>
                </li>
                <li>
                  <b>bigWig files</b> <i>(optional)</i> for genome browser
                  visualization.
                  <ul>
                    <li>
                      Optionally provide one .bw (bigWig) file per sample.
                    </li>
                    <li>
                      If included, ensure each file is listed in the 4th column
                      of the manifest.
                    </li>
                  </ul>
                </li>
              </ol>
              {textFilesHelp}
            </div>
          </div>
        </details>
      ),
    },
    dependencies: {
      required: true,
      renderInput: ReferenceGenomeDependency,
    },
    enableExperimentalOrganism: true,
  };
}

function ReferenceGenomeDependency({
  dependencies,
  setDependencies,
}: DependencyInputProps): ReactElement | null {
  const popoverStyle: Partial<ButtonStateStyleSpec> = {
    dropShadow: {
      offsetX: 'none',
      offsetY: '',
      blurRadius: '',
      color: '',
    },
    border: {
      color: '#afafaf',
      width: 1,
      style: 'solid',
    },
  };

  const styleOverrides: SelectTreeStyleSpec = {
    treeNode: {
      labelTextWrapper: {
        fontSize: '1.1em',
      },
    },

    truncateSelectionWidth: '500px',

    popoverButton: {
      container: {
        marginBottom: '1em',
      },
      default: popoverStyle,
      disabled: popoverStyle,
      hover: popoverStyle,
      pressed: popoverStyle,
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
