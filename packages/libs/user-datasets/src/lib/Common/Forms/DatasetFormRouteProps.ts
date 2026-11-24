import { VdiPluginConfig, VdiServiceMetadata } from '../../Service/Model';
import { DatasetTypeConfig, DatasetFormConfigurators, DataNoun } from '../Configuration';
import { ReactNode } from 'react';

export interface DatasetFormRouteProps {
  readonly vdiConfig: VdiServiceMetadata;

  readonly baseUrl: string;

  readonly urlParams: Readonly<Record<string, string>>;

  readonly datasetTypes: ReadonlyArray<DatasetTypeConfig>;

  readonly plugins: ReadonlyArray<VdiPluginConfig>;

  readonly datasetTypeMenuHeader?: ReactNode;

  readonly dataNoun: DataNoun;

  readonly enablePublicDatasets: boolean;

  readonly formConfigs: DatasetFormConfigurators;

  readonly datasetId?: string;
}
