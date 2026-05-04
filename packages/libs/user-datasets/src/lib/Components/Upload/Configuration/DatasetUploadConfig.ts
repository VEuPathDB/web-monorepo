import { ReactElement, ReactNode } from 'react';
import { UploadInputConfig } from './UploadFormConfig';
import { DatasetTypeConfig } from './DatasetTypeConfig';
import { UploadFormVerbiage } from "./UploadFormVerbiage";

export interface DatasetUploadConfig<T extends DatasetTypeConfig | undefined = DatasetTypeConfig> {
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
  readonly renderFileInput?: (inputField: ReactElement) => ReactNode;
}
