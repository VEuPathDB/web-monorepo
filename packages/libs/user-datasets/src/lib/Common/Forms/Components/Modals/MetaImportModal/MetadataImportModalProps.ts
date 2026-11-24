import { Consumer, Runnable } from '../../../../../Utils';
import { DataNoun } from '../../../../Configuration';
import { DatasetId, VdiServiceConfig } from '../../../../../Service/Model';

export interface MetadataImportModalProps {
  readonly isVisible: boolean;
  readonly hideModal: Runnable;

  readonly publicDatasetsEnabled: boolean;
  readonly dataNoun: DataNoun;

  readonly vdiConfig: VdiServiceConfig;

  readonly onDatasetSelect: Consumer<DatasetId>;
}