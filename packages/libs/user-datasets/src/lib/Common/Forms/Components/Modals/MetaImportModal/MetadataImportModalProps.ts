import { Consumer, DataNoun, Runnable } from '../../../../../Utils';
import { DatasetId, VdiServiceConfig } from '../../../../../Service';

export interface MetadataImportModalProps {
  readonly isVisible: boolean;
  readonly hideModal: Runnable;

  readonly baseUrl: string;
  readonly publicDatasetsEnabled: boolean;
  readonly dataNoun: DataNoun;

  readonly vdiConfig: VdiServiceConfig;

  readonly onDatasetSelect: Consumer<DatasetId>;
}