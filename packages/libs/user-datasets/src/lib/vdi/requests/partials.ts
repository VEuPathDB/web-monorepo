import { DatasetTypeSelection } from '../../Common/Configuration';
import {
  DatasetCharacteristics, DatasetContact, DatasetFundingAward,
  DatasetMetaBase, DatasetMetadataContentFlags,
  DatasetOrganism, DatasetPublication, DatasetSource,
  DatasetVisibility, LinkedDataset, SampleYearRange
} from '../../Service/Model/response-decoders';

export type PartialDatasetDetails = Readonly<
  Partial<
    Omit<
      DatasetMetaBase,
      | 'datasetCharacteristics'
      | 'datasetSources'
      | 'experimentalOrganisms'
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
  readonly datasetSources?: ReadonlyArray<PartialDatasetSource>;
  readonly experimentalOrganisms?: ReadonlyArray<PartialOrganism>;
  readonly hostOrganism?: PartialOrganism;
  readonly publications?: ReadonlyArray<PartialDatasetPublication>;
  readonly contacts?: ReadonlyArray<PartialDatasetContact>;
  readonly linkedDatasets?: ReadonlyArray<PartialLinkedDataset>;
  readonly funding?: ReadonlyArray<PartialDatasetFunding>;
  readonly metadataContentFlags?: PartialMetadataContentFlags;
};

export type PartialOrganism = Readonly<Partial<DatasetOrganism>>;

export type PartialCharacteristics = Readonly<
  Partial<Omit<DatasetCharacteristics, 'years'>>
> & {
  readonly years?: PostSampleYearRange;
};

export type PostSampleYearRange = Readonly<Partial<SampleYearRange>>;

export type PartialDatasetSource = Readonly<Partial<DatasetSource>>;

export type PartialDatasetPublication = Readonly<Partial<DatasetPublication>>;

export type PartialDatasetContact = Readonly<Partial<DatasetContact>>;

export type PartialLinkedDataset = Readonly<Partial<LinkedDataset>>;

export type PartialDatasetFunding = Readonly<Partial<DatasetFundingAward>>;

export type PartialMetadataContentFlags = Readonly<Partial<DatasetMetadataContentFlags>>;
