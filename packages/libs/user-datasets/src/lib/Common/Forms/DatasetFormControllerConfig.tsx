import { DatasetFormConfigurators, DatasetTypeConfig } from '../Configuration';
import { DataNoun } from '../../Utils';

export interface DatasetFormControllerConfig {
  readonly formConfigs: DatasetFormConfigurators;
  readonly datasetTypes: readonly DatasetTypeConfig[];

  readonly dataNoun: DataNoun;
  readonly enablePublicDatasets: boolean;
}
