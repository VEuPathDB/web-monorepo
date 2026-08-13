import { Consumer, DataNoun, SimpleState } from '../../../../../Utils';
import { DatasetId, VdiServiceConfig } from '../../../../../Service';

export interface MetadataImportModalProps {
  readonly visibleState: SimpleState<boolean>;

  readonly baseUrl: string;
  readonly publicDatasetsEnabled: boolean;
  readonly dataNoun: DataNoun;

  readonly vdiConfig: VdiServiceConfig;

  readonly onDatasetSelect: Consumer<DatasetId>;
}