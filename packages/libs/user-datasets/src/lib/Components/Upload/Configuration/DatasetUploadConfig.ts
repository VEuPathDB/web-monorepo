import { ReactElement, ReactNode } from 'react';
import { UploadInputConfig } from './UploadFormConfig';
import { DatasetTypeConfig } from './DatasetTypeConfig';
import { UploadFormVerbiage } from './UploadFormVerbiage';
import { DatasetDependency } from '../../../Service';
import { Consumer } from '../../../Utils';

export interface DatasetUploadConfig<
  T extends DatasetTypeConfig | undefined = DatasetTypeConfig
> {
  readonly verbiage: UploadFormVerbiage;

  readonly dataType: T;

  readonly uploadConfig: UploadInputConfig;

  readonly fieldOverrides?: Record<
    string,
    (element: ReactElement) => ReactNode
  >;

  readonly helpText?: () => ReactElement;

  /**
   * Optional function to override or augment the default file input field react
   * element.
   *
   * @param inputField The default upload form file input element.
   */
  readonly overrideFileInput?: (inputField: ReactElement) => ReactNode;

  readonly dependencies?: DependenciesConfig;
}

export interface DependencyInputProps {
  readonly dependencies: readonly DatasetDependency[];
  readonly setDependencies: Consumer<readonly DatasetDependency[]>;
}

export interface DependenciesConfig {
  readonly required: boolean;
  readonly renderInput: (props: DependencyInputProps) => ReactNode;
}
