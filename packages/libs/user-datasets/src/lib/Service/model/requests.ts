import * as vdi from './response-decoders';
import {
  DatasetCharacteristics,
  DatasetMetaBase,
  DatasetSource as ApiSource,
  DatasetVisibility,
  SampleYearRange,
} from "./response-decoders";
import { DatasetTypeSelection } from "../../Components/Upload/Configuration";

// region Create Dataset

export type DatasetPostDetails = Readonly<Partial<
  Omit<
    DatasetMetaBase,
    'datasetCharacteristics' | 'datasetSources'
  >
>> & {
  readonly type?: DatasetTypeSelection;
  readonly visibility?: DatasetVisibility;
  readonly datasetCharacteristics?: PostCharacteristics;
  readonly datasetSources?: PostDatasetSource[];
}

export type PostCharacteristics = Readonly<Partial<Omit<DatasetCharacteristics, 'years'>>> & {
  readonly years?: PostSampleYearRange;
};

export type PostSampleYearRange = Readonly<Partial<SampleYearRange>>;

export type PostDatasetSource = Readonly<Partial<ApiSource>>;

// endregion CreateDataset

// region Patch Dataset

interface ValuePatch<T> {
  value: T;
}

interface OptionalValuePatch<T> {
  value?: T;
}

export function valuePatch<T>(value: T): ValuePatch<T> {
  return { value };
}

export function optionalValuePatch<T>(value?: T): OptionalValuePatch<T> {
  if (value)
    return { value };
  else
    return {};
}

export interface StudyCharacteristicsPatch {
  studyDesign?: OptionalValuePatch<string>;
  studyType?: OptionalValuePatch<string>;
  countries?: OptionalValuePatch<Array<string>>;
  years?: OptionalValuePatch<vdi.SampleYearRange>;
  studySpecies?: OptionalValuePatch<Array<string>>;
  outcomes?: OptionalValuePatch<Array<string>>;
  associatedFactors?: OptionalValuePatch<Array<string>>;
  participantAges?: OptionalValuePatch<string>;
  sampleTypes?: OptionalValuePatch<Array<string>>;
}

export interface ExternalIdentifiersPatch {
  dois?: OptionalValuePatch<Array<vdi.DOIReference>>;
  hyperlinks?: OptionalValuePatch<Array<vdi.DatasetHyperlink>>;
  bioprojectIds?: OptionalValuePatch<Array<vdi.BioProjectId>>;
}

export interface DatasetPatchRequest {
  type?: ValuePatch<vdi.DatasetTypeReference>;
  visibility?: ValuePatch<vdi.DatasetVisibility>;
  name?: ValuePatch<string>;
  summary?: ValuePatch<string>;
  description?: OptionalValuePatch<string>;
  publications?: OptionalValuePatch<Array<vdi.DatasetPublication>>;
  contacts?: OptionalValuePatch<Array<vdi.DatasetContact>>;
  projectName?: OptionalValuePatch<string>;
  programName?: OptionalValuePatch<string>;
  linkedDatasets?: OptionalValuePatch<Array<vdi.LinkedDataset>>;
  experimentalOrganism?: OptionalValuePatch<vdi.DatasetOrganism>;
  hostOrganism?: OptionalValuePatch<vdi.DatasetOrganism>;
  studyCharacteristics?: StudyCharacteristicsPatch;
  externalIdentifiers?: ExternalIdentifiersPatch;
  funding?: OptionalValuePatch<Array<vdi.DatasetFundingAward>>;
  shortAttribution?: OptionalValuePatch<string>;
  daysForApproval?: OptionalValuePatch<number>;
  dataDisclaimer?: OptionalValuePatch<string>;
  datasetSources?: OptionalValuePatch<Array<vdi.DatasetSource>>;
}

// endregion Patch Dataset

/**
 * The "details" multipart/form-data value type.
 */
export interface DatasetPutRequestDetails extends DatasetPatchRequest {
  origin: string;
  revisionNote: string;
}

export type ShareReceiptAction = 'accept' | 'reject';