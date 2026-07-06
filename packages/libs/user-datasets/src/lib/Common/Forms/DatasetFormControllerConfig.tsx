import { DatasetFormConfigurators, DatasetTypeConfig } from '../Configuration';

export interface DatasetFormControllerConfig {
  readonly formConfigs: DatasetFormConfigurators;
  readonly datasetTypes: readonly DatasetTypeConfig[];
}