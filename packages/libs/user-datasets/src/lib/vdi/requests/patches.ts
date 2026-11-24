import { DatasetTypeSelection } from '../../Common/Configuration';
import {
  BioProjectId,
  DatasetContact, DatasetHyperlink,
  DatasetPublication,
  DatasetVisibility, DOIReference,
  SampleYearRange,
  DatasetFundingAward,
  DatasetOrganism,
  DatasetSource,
  LinkedDataset
} from '../../Service/Model/response-decoders';

export interface ValuePatch<T> {
  readonly value: T;
}

export interface OptionalValuePatch<T> {
  readonly value?: T;
}

export interface DatasetPatchRequest {
  readonly type?: ValuePatch<DatasetTypeSelection>;
  readonly visibility?: ValuePatch<DatasetVisibility>;
  readonly name?: ValuePatch<string>;
  readonly summary?: ValuePatch<string>;
  readonly description?: OptionalValuePatch<string>;
  readonly publications?: OptionalValuePatch<ReadonlyArray<DatasetPublication>>;
  readonly contacts?: OptionalValuePatch<ReadonlyArray<DatasetContact>>;
  readonly projectName?: OptionalValuePatch<string>;
  readonly programName?: OptionalValuePatch<string>;
  readonly linkedDatasets?: OptionalValuePatch<ReadonlyArray<LinkedDataset>>;
  readonly experimentalOrganisms?: OptionalValuePatch<DatasetOrganism>;
  readonly hostOrganism?: OptionalValuePatch<DatasetOrganism>;
  readonly studyCharacteristics?: DatasetCharacteristicsPatch;
  readonly externalIdentifiers?: ExternalIdentifiersPatch;
  readonly funding?: OptionalValuePatch<ReadonlyArray<DatasetFundingAward>>;
  readonly shortAttribution?: OptionalValuePatch<string>;
  readonly daysForApproval?: OptionalValuePatch<number>;
  readonly dataDisclaimer?: OptionalValuePatch<string>;
  readonly datasetSources?: OptionalValuePatch<ReadonlyArray<DatasetSource>>;
}

export interface DatasetCharacteristicsPatch {
  readonly studyDesign?: OptionalValuePatch<string>;
  readonly studyType?: OptionalValuePatch<string>;
  readonly countries?: OptionalValuePatch<ReadonlyArray<string>>;
  readonly years?: OptionalValuePatch<SampleYearRange>;
  readonly studySpecies?: OptionalValuePatch<ReadonlyArray<string>>;
  readonly outcomes?: OptionalValuePatch<ReadonlyArray<string>>;
  readonly associatedFactors?: OptionalValuePatch<ReadonlyArray<string>>;
  readonly participantAges?: OptionalValuePatch<string>;
  readonly sampleTypes?: OptionalValuePatch<ReadonlyArray<string>>;
}

export interface ExternalIdentifiersPatch {
  readonly dois?: OptionalValuePatch<ReadonlyArray<DOIReference>>;
  readonly hyperlinks?: OptionalValuePatch<ReadonlyArray<DatasetHyperlink>>;
  readonly bioprojectIds?: OptionalValuePatch<ReadonlyArray<BioProjectId>>;
}
