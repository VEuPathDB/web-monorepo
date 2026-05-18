import { ReactElement, ReactNode } from 'react';

export interface UploadConfig {
  readonly enabled: boolean;
  readonly renderOverride?: (inputField: ReactElement) => ReactNode;
  readonly helpText?: ReactNode;
}

interface EnabledConfig extends UploadConfig {
  readonly enabled: true;
}

interface DisabledConfig extends UploadConfig {
  readonly enabled: false;
}

export interface FileUploadConfig extends UploadConfig {}

export type EnabledFileUploadConfig = EnabledConfig & FileUploadConfig;
export type DisabledFileUploadConfig = DisabledConfig &
  Partial<FileUploadConfig>;

export type OptionalFileUploadConfig =
  | EnabledFileUploadConfig
  | DisabledFileUploadConfig;

export interface UrlUploadConfig extends UploadConfig {}

export type EnabledUrlUploadConfig = EnabledConfig & UrlUploadConfig;
export type DisabledUrlUploadConfig = DisabledConfig & Partial<UrlUploadConfig>;

export type OptionalUrlUploadConfig =
  | EnabledUrlUploadConfig
  | DisabledUrlUploadConfig;

export interface DataInputConfig {
  readonly file?: OptionalFileUploadConfig;
  readonly url?: OptionalUrlUploadConfig;

  // TODO: is this needed?  It was unused in the previous iteration of the
  //       vdi-based user dataset upload form, but it is not clear whether this
  //       was a planned feature or a defunct feature.
  readonly result?: any;

  readonly helpText?: () => ReactElement;
}
