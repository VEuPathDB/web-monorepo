import { ReactElement, ReactNode } from 'react';
import { DataInputConfig } from './UploadFormConfig';
import { DatasetTypeConfig } from './DatasetTypeConfig';
import { DatasetFormVerbiage } from './DatasetFormVerbiage';
import { DatasetDependency, PartialDatasetDetails } from '../../Service';
import { Consumer } from '../../Utils';

export interface DatasetFormConfig<
  T extends DatasetTypeConfig | undefined = DatasetTypeConfig
> {
  readonly verbiage: DatasetFormVerbiage;

  readonly dataType: T;

  readonly dataInputConfig: DataInputConfig;

  /**
   * Optional function to override or augment the default file input field react
   * element.
   *
   * @param inputField The default upload form file input element.
   */
  readonly overrideFileInput?: (inputField: ReactElement) => ReactNode;

  readonly dependencies?: DependenciesConfig;

  readonly datasetCharacteristics?: DatasetCharacteristicsFormSectionConfig;

  readonly enableExperimentalOrganism?: boolean;

  /**
   * Optional hook assembling the final set of files sent to VDI as `dataFile`
   * parts. Return value replaces `uploads.dataFiles`. Filenames arrive already
   * sanitized.
   *
   * May throw, but only as a backstop: everything it rejects is also caught by
   * the form's own validation, which reports inline against the offending
   * field. A throw here means a validation gap and surfaces as a generic
   * submit error.
   */
  readonly prepareDataFiles?: (
    dataFiles: readonly File[],
    details: PartialDatasetDetails
  ) => readonly File[];
}

export interface DatasetCharacteristicsFormSectionConfig {
  readonly enable: boolean;
  readonly studyDesignVocab: readonly [string, string][];
}

export interface DependencyInputProps {
  readonly dependencies: readonly DatasetDependency[];
  readonly setDependencies: Consumer<DatasetDependency[]>;
}

export interface DependenciesConfig {
  readonly required: boolean;
  readonly renderInput: (props: DependencyInputProps) => ReactNode;
}
