import { ClientDatasetTypeConfig } from './DatasetTypeConfig';
import { DatasetFormConfigurators } from './form-configs';

export interface EdaStudyLinks {
  readonly workspaceUrl?: string;
  readonly mapUrl?: string;
}

export interface DatasetWorkspaceConfig {
  /**
   * Basic dataset type configurations.
   *
   * Primarily used for rendering the data type selection menu before the upload
   * form for projects that allow for multiple dataset types.
   */
  readonly baseDatasetTypeConfigs: readonly ClientDatasetTypeConfig[];

  /**
   * Dataset type specific upload form configuration constructors.
   *
   * Each entry in the following array should be a tuple of dataset type
   * identifier and type-specific form config constructor.
   *
   * One should exist for every dataset type that users can upload on any site,
   * the entries will be filtered by site at a later point based on the VDI
   * service configuration.
   */
  readonly uploadFormConfigurators: DatasetFormConfigurators;

  readonly fetchEdaStudyMetadata: (wdkDatasetId: string) => EdaStudyLinks;
}