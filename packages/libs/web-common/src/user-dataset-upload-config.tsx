import {
  DependencyProps,
} from "@veupathdb/user-datasets/lib/Utils/types";
import { useOrganismTree } from "./hooks/organisms";
import { SelectTree } from "@veupathdb/coreui";
import { ReactNode, useCallback, useState } from "react";
import { projectId } from "./config";
import { useWdkService } from "@veupathdb/wdk-client/lib/Hooks/WdkServiceHook";
import { TreeBoxVocabNode } from "@veupathdb/wdk-client/lib/Utils/WdkModel";
import { Node } from "@veupathdb/wdk-client/lib/Utils/TreeUtils";
import { areTermsInString } from "@veupathdb/wdk-client/lib/Utils/SearchUtils";
import {
  DataInputProps,
  UploadFormConfig,
  newSingleFileInputConfig,
  newResultInputConfig,
  newUrlInputConfig,
} from "@veupathdb/user-datasets/src/lib/Components/FormTypes/form-config";
import {
  DatasetDependency,
  DatasetDetails,
  DatasetType,
  PluginDetails,
} from "@veupathdb/user-datasets/src/lib/Service/Types";
import { toVdiCompatibleWdkService } from "@veupathdb/user-datasets/src/lib/Service";
import { InputDatasetType } from "@veupathdb/user-datasets/src/lib/Service/Types/io-types";
import { ServiceConfiguration } from "@veupathdb/user-datasets/src/lib/Service/Types/service-types";

// region Display Text

export const initDisplayText = () => ({

  common: {
    dataset: {
      nounSingular: "Data set",
      nounPlural: "Data sets",
    },
  },

  workspace: {
    title: "My Data Sets",
  },

  detailsPage: {
    title: (dataset: DatasetDetails): ReactNode => <>My Data Set: <i>{dataset.name}</i></>,
  },

  formDisplay: {
    requiredInfo: {
      title: "Required Information",
      nameFieldLabel: "Data set name",
      summaryFieldLabel: "Summary",
      summaryPlaceholder: "Provide a concise summary of the data set (max 400 characters).",
      dependenciesFieldLabel: "Reference genome",
      uploadField: {
        label: "Data",
        fileText: "File",
        resultText: "Strategy",
        urlText: "URL",
        urlPlaceholder: "Address of a data file from the Web",
      },
      visibilityFieldLabel: "Data accessibility",
    },

    additionalInfo: {
      title: "Additional Information",
      importButtonText: "Import from Existing Data Set",

      fundamentals: {
        title: "Fundamental Information",

        dataDictionary: {
          sectionHeader: "Data Dictionary",

          uploadHint: <div>
            File must:
            <ul>
              <li>be in .csv, .tsv, or tab-delimited .txt format</li>
              <li>contain one row for every variable in the data file</li>
              <li>include columns labeled (i) variable; (ii) label; (iii)
                definition
              </li>
            </ul>
            <br/>
            See 'Help' for more information on how to properly format your data
            dictionary
          </div>,
        },

        contacts: {
          sectionHeader: "Principal Investigators and Collaborators",

          primaryContactHeader: "Primary contact",
          additionalContactHeader: "Additional contact",
          addContactLabel: "Additional contact",

          copyProfileInfoButtonText: "Copy from My Profile",

          firstNameLabel: "First name",
          middleNameLabel: "Middle name",
          lastNameLabel: "Last name",
          emailLabel: "Email",
          retypeEmailLabel: "Retype email",
          affiliationLabel: "Organization name",
          countryLabel: "Country",
        },
      },

      recommended: {
        sectionHeader: "Recommended Information",

        publications: {
          sectionHeader: "Publications",
          pubmedIdLabel: "PMID",
          doiLabel: "DOI",
          primaryPublicationLabel: "Primary publication",
        },

        funding: {
          sectionHeader: "Funding",
          agencyLabel: "Agency",
          awardNumLabel: "Award number",
        },

        datasetInfo: {
          sectionHeader: "Data Set Information",

          firstAuthorLabel: "First author",
          addAuthorText: "Additional first author",
          firstAuthorHelp: <>
            For a dataset derived from a published manuscript, the first author
            is the first author of the manuscript. If this dataset is not
            included in a published dataset, the first author is the individual
            who made the leading contribution to its creation, design, and
            preparation for sharing.
          </>,

          descriptionLabel: "Description",
          descriptionPlaceholder: "Longer description of the study including"
            + " background, objectives, methodology, etc.",
        },

        experimentalOrganismHeader: "Experimental Organism",
        hostOrganismHeader: "Host Organism",
        externalIdentifiersHeader: "External Identifiers",
      },
      optional: {
        title: "Optional Information",
        affiliationsHeader: "Project and Programmatic Affiliations",
        relatedDataHeader: "VEuPathDB Related Data Sets and Studies",
        characteristicsHeader: "Field or Clinical Study Characteristics",
      },
    },
    uploadButtonLabel: "Upload Data Set",
  },
} as const);

export type DisplayText = ReturnType<typeof initDisplayText>;

export type DisplayTextOverride<T extends DisplayText = DisplayText> =
  (original: DisplayText) => T;

// endregion Display Text

// region Implemented Dataset Types

export const EnabledDatasetTypes = {
  BigWig: "bigwigfiles",
  BIOM: "biom",
  GeneList: "genelist",
  ISASimple: "isasimple",
  Lightweight: "lightweight",
  RNASeq: "rnaseq",
  Phenotype: "phenotype",
} as const;

export type EnabledDatasetType = typeof EnabledDatasetTypes[keyof typeof EnabledDatasetTypes];

interface EnabledDatasetTypeRef extends InputDatasetType {
  readonly name: EnabledDatasetType;
}

type ConfigEntryConstructor = (dt: PluginDetails) => UploadFormConfig;

export type DatasetInstaller = PluginDetails;

/**
 * Provides a list of the VDI dataset installer plugins that are enabled for the
 * current project id.
 */
export function useAllCompatibleInstallers(): DatasetInstaller[] {
  return useWdkService(async wdk => toVdiCompatibleWdkService(wdk).vdiService.getPlugins())
    ?.filter(p => !p.installTargets || p.installTargets.find(it => it === projectId)) ?? [];
}

// endregion Implemented Dataset Types

// region Type Specific Form Configs

const pruneDatasetType = ({ name, version }: DatasetType) =>
  ({ name, version }) as EnabledDatasetTypeRef;

export function uploadTypeConfigs(
  { features }: ServiceConfiguration,
  installers: readonly DatasetInstaller[],
): readonly UploadFormConfig[] {
  const fullMap = newAllDataTypeConfigMap();
  const result = [];

  for (const installer of installers) {
    const value = fullMap.get(pruneDatasetType(installer.type));
    if (!value)
      continue;

    result.push(value({
      ...installer,
      allowedFileExtensions: features.supportedArchiveTypes.concat(installer.allowedFileExtensions),
    }));
  }

  return result;
}

export const uploadTypeConfig = (datasetType: DatasetInstaller) =>
  newAllDataTypeConfigMap().get(pruneDatasetType(datasetType.type))?.(datasetType);

function newAllDataTypeConfigMap(): Map<EnabledDatasetTypeRef, ConfigEntryConstructor> {
  return new Map([
    [ { name: EnabledDatasetTypes.BigWig, version: "1.0" }, newBigWigConfigEntry ],
    [ { name: EnabledDatasetTypes.BIOM, version: "1.0" }, newBiomConfigEntry ],
    [ { name: EnabledDatasetTypes.GeneList, version: "1.0" }, newGenelistConfigEntry ],
    [ { name: EnabledDatasetTypes.ISASimple, version: "1.0" }, newIsaConfigEntry ],
    [ { name: EnabledDatasetTypes.Lightweight, version: "1.0" }, newNoopConfigEntry ],
    [ { name: EnabledDatasetTypes.RNASeq, version: "1.0" }, newRnaSeqConfigEntry ],
    [ { name: EnabledDatasetTypes.RNASeq, version: "1.0" }, newPhenotypeConfigEntry ],
  ]);
}

function newBigWigConfigEntry(dt: DatasetInstaller): UploadFormConfig {
  return {
    installer: dt,
    uploadTitle: "Upload My bigWig Data Set",
    menuConfig: {
      description: `Integrate your bigWig data in ${projectId}.`,
    },
    dependencies: {
      label: "Reference Genome",
      render: props => <ReferenceGenomeDependency {...props} />,
    },
    uploadMethodConfigs: [ newSingleFileInputConfig(defaultInputConfigElement) ],
    renderFormFooterInfo: ([ { installer } ]) => <>
      <p className="formInfo">
        We accept .bw files in the
        <a href="https://genome.ucsc.edu/goldenpath/help/bigWig.html">
          bigWig format
        </a>.
        <br/>
        If you need to upload more than one file please make a compressed file
        with all your bigWig files (a
        {/*.tar.gz, *//*.tar.gz disabled due to browser bug*/}.tgz or .zip file).
      </p>
      <ul>
        <li>
          Each bigWig file must be mapped to the genome that you selected
          above.
        </li>
        <li>Data file(s) must be less than {renderSizeBytes(installer.maxFileSize)}.</li>
        <li>
          Please restrict the .bw file names to &lt; 100 chars and use
          only letters, numbers, spaces and dashes.
        </li>
      </ul>
    </>,
  };
}

function newBiomConfigEntry(dt: DatasetInstaller): UploadFormConfig {
  return {
    installer: dt,
    uploadTitle: "Upload My Data Set",
    menuConfig: {
      description: `Integrate your BIOM study data in ${projectId}.`,
    },
    uploadMethodConfigs: [
      newSingleFileInputConfig(({ formField }) => <>
        {formField}
        <p style={{ marginTop: "0.25em" }}>
          Data file must be less than {renderSizeBytes(dt.maxFileSize)}.
        </p>
      </>),
    ],
    renderFormFooterInfo: () => <>
      <p className="formInfo">
        We accept any file in the
        <a href="http://biom-format.org">BIOM format</a>, either JSON-based
        (BIOM 1.0) or HDF5 (BIOM 2.0+).
      </p>
      <p>
        If possible, try including taxonomic information and rich sample details
        in your file. This will allow you to select groups of samples and create
        meaningful comparisons at a desired aggregation level, using our
        filtering and visualisation tools.
      </p>
    </>,
  };
}

function newGenelistConfigEntry(dt: DatasetInstaller): UploadFormConfig {
  return {
    installer: dt,
    uploadTitle: "Upload My Gene List",
    menuConfig: {
      description: `Integrate your gene list in ${projectId}.`,
    },
    uploadMethodConfigs: [
      newResultInputConfig({
        transcript: {
          reportName: "attributesTabular",
          reportConfig: {
            attributes: [ "primary_key" ],
            includeHeader: false,
            attachmentType: "plain",
            applyFilter: true,
          },
        },
      }),
    ],
  };
}

function newIsaConfigEntry(dt: DatasetInstaller): UploadFormConfig {
  return {
    installer: dt,
    uploadTitle: "Upload My Study",
    menuConfig: {
      description: `Integrate your study data in ${projectId}.`,
    },
    uploadMethodConfigs: [
      newSingleFileInputConfig(({ formField }) => <>
        {formField}
        <div style={{ marginTop: "0.25em" }}>
          File must be a .csv, .tsv, or tab-delimited .txt file.
        </div>
      </>),
      newUrlInputConfig(),
    ],
  };
}

function newNoopConfigEntry(dt: DatasetInstaller): UploadFormConfig {
  return {
    installer: dt,
    uploadTitle: "", // FIXME: upload title for upload-only datasets
    menuConfig: {
      description: "", // FIXME: description for upload-only datasets
    },
    uploadMethodConfigs: [ newSingleFileInputConfig(defaultInputConfigElement) ],
  };
}

function newPhenotypeConfigEntry(dt: DatasetInstaller): UploadFormConfig {
  return {
    installer: dt,
    uploadTitle: "Upload My Phenotype data set",
    menuConfig: {
      description: `Integrate your Phenotype data in ${projectId}.`,
    },
    uploadMethodConfigs: [
      newSingleFileInputConfig(
        ({ formField }) => <>
          {formField}
          <div style={{ marginTop: "0.25em" }}>
            File must be a tab-delimited .txt file File must be less than
            {renderSizeBytes(dt.maxFileSize)}
          </div>
        </>,
      ),
    ],
    renderFormFooterInfo: () => (
      <div className="formInfo">
        Upload your phenotype data in a tab delimited file.
        <br/>
        The file name should be &lt; 100 chars and use only letters, numbers,
        spaces and dashes.
        <br/>
        The file should contain:
        <ul>
          <li>Meaningful column headers</li>
          <li>A gene Id column with header "Gene ID"</li>
          <li>
            Valid gene Ids should:
            <ul>
              <li>include only these characters [a-zA-Z0-9().:_-]*$</li>
              <li>have at least one alphabetical character</li>
              <li>be at most 40 characters</li>
            </ul>
          </li>
        </ul>
        Rows with invalid IDs will be discarded.
      </div>
    ),
  };
}

function newRnaSeqConfigEntry(dt: DatasetInstaller): UploadFormConfig {
  return {
    installer: dt,
    uploadTitle: "Upload My Normalized RNA-Seq Data Set",
    menuConfig: {
      displayNameOverride: () => "Normalized RNA-Seq",
      description: `Integrate your Normalized RNA-Seq data in ${projectId}.`,
    },
    dependencies: {
      label: "Reference Genome",
      render: props => <ReferenceGenomeDependency {...props} />,
    },
    uploadMethodConfigs: [ newSingleFileInputConfig(defaultInputConfigElement) ],
    renderFormFooterInfo: () => <>
      <p className="formInfo">
        <b>Upload your Normalized RNA-Seq data set</b>
      </p>
      To upload your data set:
      <ul>
        {/*<li>compress the files into a .tar.gz, .tgz or .zip file.</li> // .tar.gz is disabled due to browser bug*/}
        <li>compress the files into a .tgz or .zip file.</li>
        <li>compress the set of files, not a folder containing them.</li>
        <li>make sure there are no empty files.</li>
      </ul>
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
      Optionally, you may include <b>bigWig files</b> (.bw extension) in your
      compressed file:
      <ul>
        <li>
          they are not required but will allow visualization in the genome
          browser.
        </li>
        <li>add these file names in the manifest file.</li>
        <li>make sure there are no empty files.</li>
      </ul>
    </>,
  };
}

function defaultInputConfigElement(props: DataInputProps): ReactNode {
  return <>
    {props.formField}
    <p style={{ marginTop: "0.25em" }}>
      Data file(s) cannot be larger than {renderSizeBytes(props.installer.maxFileSize)}.
      <br/>
      Upload file cannot be larger than {renderSizeBytes(props.vdiConfig.api.maxUploadSize)}.
    </p>
  </>;
}

// endregion Type Specific Form Configs

// region Shared Utils

const Kibibyte = 1024;
const Mebibyte = 1048576;
const Gibibyte = 1073741824;

function renderSizeBytes(size: number): string {
  let scale;
  let suffix;

  switch (true) {
    case size > Gibibyte:
      scale = Gibibyte;
      suffix = "GiB";
      break;
    case size > Mebibyte:
      scale = Mebibyte;
      suffix = "MiB";
      break;
    case size > Kibibyte:
      scale = Kibibyte;
      suffix = "KiB";
      break;
    default:
      return `${size}B`;
  }

  return `${Math.round(size / scale * 10) / 10}${suffix}`;
}

function ReferenceGenomeDependency(props: DependencyProps) {
  const { value, onChange } = props;

  const selectedList = value?.map((entry) => entry.resourceDisplayName);
  const organismTree = useOrganismTree(true);

  const fileNameByTerm = useWdkService(async (wdkService) => {
    const genomeDataTypesResult = await wdkService.getAnswerJson(
      {
        searchName: "GenomeDataTypes",
        searchConfig: { parameters: {} },
      },
      {
        attributes: [ "organism_full", "name_for_filenames" ],
        pagination: {
          numRecords: -1,
          offset: 0,
        },
      },
    );
    return new Map(
      genomeDataTypesResult.records.map((rec) => [
        rec.attributes.organism_full as string,
        rec.attributes.name_for_filenames as string,
      ]),
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
        .map(term => {
          const fileName = fileNameByTerm.get(term);
          return fileName == null
            ? undefined
            : {
              resourceDisplayName: term,
              resourceIdentifier: `${projectId}-${buildNumber}_${fileName}_Genome`,
              resourceVersion: buildNumber,
            } as DatasetDependency;
        })
        .filter(dep => dep != null) as DatasetDependency[];
      onChange(dependencies);
    },
    [ buildNumber, fileNameByTerm, onChange ],
  );
  const [ expandedNodes, setExpandedNodes ] = useState<string[]>([]);
  const [ searchTerm, setSearchTerm ] = useState("");

  if (organismTree == null)
    return null;

  const styleOverrides = {
    treeNode: {
      labelTextWrapper: {
        fontSize: "1.1em",
      },
    },
  };

  return (
    <SelectTree
      shouldCloseOnSelection
      buttonDisplayContent="Choose reference genome"
      tree={organismTree}
      getNodeId={n => n.data.term}
      getNodeChildren={n => n.children}
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

function searchPredicate(node: Node<TreeBoxVocabNode>, terms: string[]) {
  return areTermsInString(terms, node.data.display);
}

// endregion Shared Utils
