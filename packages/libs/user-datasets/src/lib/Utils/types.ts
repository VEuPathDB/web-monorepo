import React, { ReactNode } from 'react';

import {
  TypeOf,
  array,
  intersection,
  number,
  type,
  partial,
  string,
  keyof,
  boolean,
} from 'io-ts';

export interface UserDatasetMeta {
  description: string;
  name: string;
  summary: string;
}

export interface UserDatasetShare {
  time?: number;
  user: number;
  email?: string;
  userDisplayName: string;
}

export interface UserDataset {
  created: number | string;
  age: number;
  dependencies: Array<{
    resourceDisplayName: string;
    resourceIdentifier: string;
    resourceVersion: string;
  }>;
  projects: string[];
  id: string;
  meta: UserDatasetMeta;
  owner: string;
  ownerUserId: number;
  percentQuotaUsed: number;
  sharedWith: UserDatasetShare[] | undefined;
  questions: string[];
  size?: number;
  type: {
    name: string;
    display: string;
    version: string;
  };
  fileCount?: number;
  status: UserDatasetVDI['status'];
  fileListing?: UserDatasetFileListing;
}

export interface UserDatasetUpload {
  id: string;
  datasetId?: number;
  datasetName: string;
  summary?: string;
  description?: string;
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
    name?: {
      inputProps: Partial<React.InputHTMLAttributes<HTMLInputElement>>;
    };
    summary?: {
      inputProps: Partial<React.InputHTMLAttributes<HTMLInputElement>>;
    };
    description?: {
      inputProps: Partial<React.TextareaHTMLAttributes<HTMLTextAreaElement>>;
    };
    uploadMethodConfig: {
      file?: FileUploadConfig;
      url?: UrlUploadConfig;
      result?: ResultUploadConfig;
    };
    renderInfo?: () => ReactNode;
  };
}

export interface FileUploadConfig {
  render?: (props: { fieldNode: ReactNode }) => ReactNode;
}

export interface UrlUploadConfig {
  offer: boolean;
}

export interface ResultUploadConfig {
  offerStrategyUpload: boolean;
  compatibleRecordTypes: CompatibleRecordTypes;
}

export type CompatibleRecordTypes = Record<
  string,
  { reportName: string; reportConfig: unknown }
>;

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
      }
    | {
        type: 'result';
        stepId: number;
        reportName: string;
        reportConfig: unknown;
      };
}

export type UserDatasetShareResponse = {
  [Key in 'grant' | 'revoke']: {
    [Key in string]: UserDataset['sharedWith'];
  };
};

/**
 * In EDA, data is referred to as "Study" or "Studies"
 * In genomics, data is referred to as "Data Set" or "Data Sets"
 */
export type DataNoun = {
  singular: string;
  plural: string;
};

// VDI types
const userMetadata = partial({
  firstName: string,
  lastName: string,
  email: string,
  organization: string,
});

const ownerDetails = intersection([
  type({
    userId: number,
  }),
  userMetadata,
]);

const datasetTypeDetails = intersection([
  type({
    name: string,
    version: string,
  }),
  partial({
    displayName: string,
  }),
]);

const installStatus = keyof({
  complete: null,
  'failed-validation': null,
  'failed-installation': null,
  'ready-for-reinstall': null,
  'missing-dependency': null,
  running: null,
});

const installDetails = intersection([
  type({
    projectId: string,
  }),
  partial({
    metaStatus: installStatus,
    metaMessage: string,
    dataStatus: installStatus,
    dataMessage: string,
  }),
]);

const importStatus = keyof({
  'in-progress': null,
  complete: null,
  invalid: null,
  failed: null,
  queued: null,
});

const statusDetails = intersection([
  type({
    import: importStatus,
  }),
  partial({
    install: array(installDetails),
  }),
]);

const visibilityOptions = keyof({
  private: null,
  protected: null,
  public: null,
});

const userDatasetRecipientDetails = type({
  userId: number,
  firstName: string,
  lastName: string,
  organization: string,
});

export const datasetIdType = type({ datasetId: string });

export const userDataset = intersection([
  datasetIdType,
  type({
    owner: ownerDetails,
    datasetType: datasetTypeDetails,
    visibility: visibilityOptions,
    name: string,
    origin: string,
    projectIds: array(string),
    status: statusDetails,
    created: string,
    fileCount: number,
    fileSizeTotal: number,
  }),
  partial({
    summary: string,
    description: string,
    sourceUrl: string,
    shares: array(
      intersection([userDatasetRecipientDetails, type({ accepted: boolean })])
    ),
    importMessages: array(string),
  }),
]);

const userDatasetDetailsShareDetails = type({
  status: keyof({ grant: null, revoke: null }),
  recipient: userDatasetRecipientDetails,
});

export const userDatasetDetails = intersection([
  datasetIdType,
  type({
    owner: ownerDetails,
    datasetType: datasetTypeDetails,
    visibility: visibilityOptions,
    name: string,
    origin: string,
    projectIds: array(string),
    status: statusDetails,
    created: string,
  }),
  partial({
    summary: string,
    description: string,
    sourceUrl: string,
    shares: array(userDatasetDetailsShareDetails),
    importMessages: array(string),
  }),
]);

export const userQuotaMetadata = type({
  quota: type({
    limit: number,
    usage: number,
  }),
});

export const userDatasetFileListing = partial({
  upload: type({
    zipSize: number,
    contents: array(type({ fileName: string, fileSize: number })),
  }),
  install: type({
    zipSize: number,
    contents: array(type({ fileName: string, fileSize: number })),
  }),
});

export interface NewUserDatasetMeta {
  name: string;
  datasetType: {
    name: string;
    version: string;
  };
  origin: string;
  projects: string[];
  dependencies: {
    resourceDisplayName: string;
    resourceIdentifier: string;
    resourceVersion: string;
  }[];
  visibility?: 'private' | 'public' | 'protected';
  summary?: string;
  description?: string;
}

export type UserDatasetVDI = TypeOf<typeof userDataset>;
export type UserDatasetDetails = TypeOf<typeof userDatasetDetails>;
export type UserQuotaMetadata = TypeOf<typeof userQuotaMetadata>;
export type UserDatasetFileListing = TypeOf<typeof userDatasetFileListing>;
export type UserDatasetInstallDetailsByProject = TypeOf<typeof installDetails>;
