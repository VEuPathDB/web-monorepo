import { ReactNode } from 'react';

interface InputConfig {
  readonly label?: ReactNode;
  readonly placeholder?: string;
}

interface CoreInputConfigs {
  readonly name?: InputConfig;
  readonly summary?: InputConfig;
}

export interface UploadFormVerbiage {
  readonly formTitle: string;
  readonly afterUploadHelpText?: ReactNode;
  readonly metadataSectionTitle?: string;

  readonly formInputs?: CoreInputConfigs;
}
