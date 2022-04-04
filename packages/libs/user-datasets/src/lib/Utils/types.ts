import { ReactNode } from 'react';

export interface UserDatasetMeta {
  description: string;
  name: string;
  summary: string;
}

export interface UserDatasetShare {
  time: number;
  user: number;
  email: string;
  userDisplayName: string;
}

export interface UserDataset {
  created: number;
  age: number;
  isInstalled: boolean;
  isCompatible: boolean;
  dependencies: Array<{
    resourceDisplayName: string;
    resourceIdentifier: string;
    resourceVersion: string;
  }>;
  datafiles: Array<{
    name: string;
    size: number;
  }>;
  projects: string[];
  id: number;
  meta: UserDatasetMeta;
  modified: number;
  owner: string;
  ownerUserId: number;
  percentQuotaUsed: number;
  sharedWith: UserDatasetShare[] | undefined;
  questions: string[];
  size: number;
  type: {
    name: string;
    display: string;
    version: string;
  };
  uploaded: number;
}

export interface UserDatasetUpload {
  id: string;
  datasetId?: number;
  datasetName: string;
  summary: string;
  projects: string[];
  status: string;
  errors: string[];
  stepPercent?: number;
  started: string;
  finished?: string;
  isOngoing: boolean;
  isCancellable: boolean;
  isSuccessful: boolean;
  isUserError: boolean;
}

export type DatasetUploadTypeConfig<T extends string> = {
  [K in T]: DatasetUploadTypeConfigEntry<K>;
};

export interface DatasetUploadTypeConfigEntry<T extends string> {
  type: T;
  uploadTitle: string;
  formConfig: {
    uploadMethodConfig: {
      strategy:
        | { offer: false }
        | {
            offer: true;
            compatibleRecordTypes: string[];
          };
    };
    renderInfo: () => ReactNode;
  };
}

export type DatasetUploadPageConfig<
  T1 extends string = string,
  T2 extends string = string
> =
  | { hasDirectUpload: false }
  | {
      hasDirectUpload: true;
      availableUploadTypes: T1[];
      uploadTypeConfig: DatasetUploadTypeConfig<T2>;
    };

export interface NewUserDataset extends UserDatasetMeta {
  datasetType: string; // In prototype, the only value is "biom" - will eventually be an enum
  projects: string[];
  uploadMethod:
    | {
        type: 'file';
        file: File;
      }
    | {
        type: 'url';
        url: string;
      };
}
