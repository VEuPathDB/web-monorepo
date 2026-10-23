import { ReactElement, ReactNode } from 'react';

export interface UploadConfig {
  readonly renderOverride?: (inputField: ReactElement) => ReactNode;
  readonly helpText?: ReactNode;
}

/** One data file input. Position in `slots` maps to position in `dataFiles`. */
export interface FileInputConfig {
  readonly label: string;
  readonly required: boolean;

  readonly buttonText?: string;

  /** `accept` attribute override. Defaults to the data type's extensions. */
  readonly accept?: string;

  readonly helpText?: ReactNode;
}

export interface FileUploadConfig extends UploadConfig {
  /**
   * Labelled data file inputs. Declaring two or more renders one input per
   * slot; otherwise the single default input is rendered.
   */
  readonly fileInputs?: readonly FileInputConfig[];
}

export interface UrlUploadConfig extends UploadConfig {}

export interface DataInputConfig {
  readonly byFile?: FileUploadConfig;
  readonly byUrl?: UrlUploadConfig;

  // TODO: is this needed?  It was unused in the previous iteration of the
  //       vdi-based user dataset upload form, but it is not clear whether this
  //       was a planned feature or a defunct feature.
  readonly byResult?: any;

  readonly helpText?: () => ReactElement;
}
