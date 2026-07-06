import { ReactElement, ReactNode } from 'react';
import { DataInputConfig } from './UploadFormConfig';
import { DatasetTypeConfig } from './DatasetTypeConfig';
import { DatasetFormVerbiage } from './DatasetFormVerbiage';
import { DatasetDependency } from '../../Service';
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
