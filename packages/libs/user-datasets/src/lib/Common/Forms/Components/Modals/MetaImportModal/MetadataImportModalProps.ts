import { DataNoun } from '../../../../../Utils';
import { DatasetId, VdiServiceConfig } from '../../../../../Service';

export interface MetadataImportModalProps {
  readonly isVisible: boolean;
  readonly hideModal: () => void;

  readonly baseUrl: string;
  readonly publicDatasetsEnabled: boolean;
  readonly dataNoun: DataNoun;

  readonly vdiConfig: VdiServiceConfig;

  readonly onDatasetSelect: (id: DatasetId) => void;
}