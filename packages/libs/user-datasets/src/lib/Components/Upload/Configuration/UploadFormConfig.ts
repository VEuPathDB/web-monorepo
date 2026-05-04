import React from 'react';

export interface UploadConfig {
  readonly enabled: boolean;
  readonly renderOverride?: (inputField: React.ReactElement) => React.ReactNode;
  readonly helpText?: React.ReactNode;
}

export interface FileUploadConfig extends UploadConfig {}

export interface UrlUploadConfig extends UploadConfig {}

export type CompatibleRecordTypes = Record<
  string,
  { reportName: string; reportConfig: unknown }
>;

export interface ResultUploadConfig extends UploadConfig {
  // TODO: what does this mean?
  readonly offerStrategyUpload: boolean;
  readonly compatibleRecordTypes: CompatibleRecordTypes;
}

export interface UploadInputConfig {
  readonly file?: FileUploadConfig;
  readonly result?: ResultUploadConfig;
  readonly url?: UrlUploadConfig;
}
