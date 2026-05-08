import React from 'react';

export interface UploadConfig {
  readonly enabled: boolean;
  readonly renderOverride?: (inputField: React.ReactElement) => React.ReactNode;
  readonly helpText?: React.ReactNode;
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

export interface UploadInputConfig {
  readonly file?: OptionalFileUploadConfig;
  readonly url?: OptionalUrlUploadConfig;
}
