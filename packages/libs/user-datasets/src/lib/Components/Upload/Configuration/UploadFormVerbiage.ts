import { ReactElement, ReactNode } from 'react';

export interface InputConfig {
  readonly label?: ReactNode;
  readonly placeholder?: string;
}

export interface CoreInputConfigs {
  readonly name?: InputConfig;
  readonly summary?: InputConfig;
  readonly dependencies?: string;
  readonly datasetProperties?: {
    readonly label: string;
    readonly helpText?: () => ReactElement;
  };
}

export interface UploadFormVerbiage {
  readonly formTitle: string;
  readonly afterUploadHelpText?: ReactNode;

  readonly formInputs?: CoreInputConfigs;
}
