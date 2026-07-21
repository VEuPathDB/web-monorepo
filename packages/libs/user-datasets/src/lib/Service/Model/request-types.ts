import * as vdi from './response-decoders';

import {
  DatasetCharacteristics,
  DatasetContact,
  DatasetFundingAward,
  DatasetMetaBase,
  DatasetOrganism,
  DatasetPublication,
  DatasetSource as ApiSource,
  DatasetVisibility,
  LinkedDataset,
  SampleYearRange,
} from './response-decoders';

import { DatasetTypeSelection } from '../../Common/Configuration';

export type GetDatasetsQueryParamEnum = 'install_target' | 'ownership';

// region Create Dataset

export type PartialDatasetDetails = Readonly<
  Partial<
    Omit<
      DatasetMetaBase,
      | 'datasetCharacteristics'
      | 'datasetSources'
      | 'experimentalOrganism'
      | 'hostOrganism'
      | 'publications'
      | 'contacts'
      | 'linkedDatasets'
      | 'funding'
    >
  >
> & {
  readonly type?: DatasetTypeSelection;
  readonly visibility?: DatasetVisibility;
  readonly datasetCharacteristics?: PartialCharacteristics;
  readonly datasetSources?: readonly PostDatasetSource[];
  readonly experimentalOrganism?: PartialOrganism;
  readonly hostOrganism?: PartialOrganism;
  readonly publications?: readonly PartialDatasetPublication[];
  readonly contacts?: readonly PartialDatasetContact[];
  readonly linkedDatasets?: readonly PartialLinkedDataset[];
  readonly funding?: readonly PartialDatasetFunding[];
};

export type PartialOrganism = Readonly<Partial<DatasetOrganism>>;

export type PartialCharacteristics = Readonly<
  Partial<Omit<DatasetCharacteristics, 'years'>>
> & {
  readonly years?: PostSampleYearRange;
};

export type PostSampleYearRange = Readonly<Partial<SampleYearRange>>;

export type PostDatasetSource = Readonly<Partial<ApiSource>>;

export type PartialDatasetPublication = Readonly<Partial<DatasetPublication>>;

export type PartialDatasetContact = Readonly<Partial<DatasetContact>>;

export type PartialLinkedDataset = Readonly<Partial<LinkedDataset>>;

export type PartialDatasetFunding = Readonly<Partial<DatasetFundingAward>>;

// endregion CreateDataset

// region Patch Dataset

export interface ValuePatch<T> {
  readonly value: T;
}

export interface OptionalValuePatch<T> {
  readonly value?: T;
}

export interface DatasetPatchRequest {
  readonly type?: ValuePatch<DatasetTypeSelection>;
  readonly visibility?: ValuePatch<vdi.DatasetVisibility>;
  readonly name?: ValuePatch<string>;
  readonly summary?: ValuePatch<string>;
  readonly description?: OptionalValuePatch<string>;
  readonly publications?: OptionalValuePatch<Array<vdi.DatasetPublication>>;
  readonly contacts?: OptionalValuePatch<Array<vdi.DatasetContact>>;
  readonly projectName?: OptionalValuePatch<string>;
  readonly programName?: OptionalValuePatch<string>;
  readonly linkedDatasets?: OptionalValuePatch<Array<vdi.LinkedDataset>>;
  readonly experimentalOrganism?: OptionalValuePatch<vdi.DatasetOrganism>;
  readonly hostOrganism?: OptionalValuePatch<vdi.DatasetOrganism>;
  readonly studyCharacteristics?: DatasetCharacteristicsPatch;
  readonly externalIdentifiers?: ExternalIdentifiersPatch;
  readonly funding?: OptionalValuePatch<Array<vdi.DatasetFundingAward>>;
  readonly shortAttribution?: OptionalValuePatch<string>;
  readonly daysForApproval?: OptionalValuePatch<number>;
  readonly dataDisclaimer?: OptionalValuePatch<string>;
  readonly datasetSources?: OptionalValuePatch<Array<vdi.DatasetSource>>;
}

export interface DatasetCharacteristicsPatch {
  readonly studyDesign?: OptionalValuePatch<string>;
  readonly studyType?: OptionalValuePatch<string>;
  readonly countries?: OptionalValuePatch<Array<string>>;
  readonly years?: OptionalValuePatch<vdi.SampleYearRange>;
  readonly studySpecies?: OptionalValuePatch<Array<string>>;
  readonly outcomes?: OptionalValuePatch<Array<string>>;
  readonly associatedFactors?: OptionalValuePatch<Array<string>>;
  readonly participantAges?: OptionalValuePatch<string>;
  readonly sampleTypes?: OptionalValuePatch<Array<string>>;
}

export interface ExternalIdentifiersPatch {
  readonly dois?: OptionalValuePatch<Array<vdi.DOIReference>>;
  readonly hyperlinks?: OptionalValuePatch<Array<vdi.DatasetHyperlink>>;
  readonly bioprojectIds?: OptionalValuePatch<Array<vdi.BioProjectId>>;
}

// endregion Patch Dataset

/**
 * The "details" multipart/form-data value type.
 */
export interface DatasetPutDetails extends DatasetPatchRequest {
  origin: string;
  revisionNote: string;
}

export type ShareReceiptAction = 'accept' | 'reject';
