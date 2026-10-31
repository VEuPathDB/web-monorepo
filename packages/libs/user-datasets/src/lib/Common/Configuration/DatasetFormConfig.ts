import { ReactElement, ReactNode } from 'react';
import { DataInputConfig } from './UploadFormConfig';
import { DatasetTypeConfig } from './DatasetTypeConfig';
import { DatasetFormVerbiage } from './DatasetFormVerbiage';
import { DatasetDependency } from '../../Service';
import { Consumer } from '../../Utils';
import { UploadContentMap } from '../../Service/Model/utility-types';

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
  readonly prepareDataFiles?: (dataFiles: UploadContentMap) => UploadContentMap;
}

export interface StudyDesignOption {
  /** Label shown in the select; stored as `studyDesign`. */
  readonly design: string;

  /**
   * Broader category of the design; stored as `studyType`.
   * One of `Experimental`, `Observational`, `Review` or `n/a`.
   */
  readonly studyType: string;

  /** Short help shown to users when this design is selected. */
  readonly help?: string;
}

export interface DatasetCharacteristicsFormSectionConfig {
  readonly enable: boolean;
  readonly studyDesignVocab: readonly StudyDesignOption[];
}

export interface DependencyInputProps {
  readonly dependencies: readonly DatasetDependency[];
  readonly setDependencies: Consumer<DatasetDependency[]>;
}

export interface DependenciesConfig {
  readonly required: boolean;
  readonly renderInput: (props: DependencyInputProps) => ReactNode;
}
