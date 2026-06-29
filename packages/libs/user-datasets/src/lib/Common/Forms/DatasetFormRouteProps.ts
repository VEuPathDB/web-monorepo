import { VdiPluginConfig, VdiServiceMetadata } from '../../Service';
import { DatasetTypeConfig, DatasetFormConfigurators } from '../Configuration';
import { ReactNode } from 'react';

export interface DatasetFormRouteProps {
  readonly vdiConfig: VdiServiceMetadata;
  readonly baseUrl: string;
  readonly urlParams: Record<string, string>;
  readonly datasetTypes: readonly DatasetTypeConfig[];
  readonly plugins: readonly VdiPluginConfig[];
  readonly datasetTypeMenuHeader?: ReactNode;

  readonly formConfigs: DatasetFormConfigurators;
  readonly datasetId?: string;
}
