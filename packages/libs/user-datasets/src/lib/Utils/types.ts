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
  visibility: UserDatasetVisibility;
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
  dependencies?: Array<{
    resourceDisplayName: string;
    resourceIdentifier: string;
    resourceVersion: string;
  }>;
  projects: string[];
  id: string;
  meta: UserDatasetMeta;
  owner: string;
  ownerUserId: number;
  sharedWith: UserDatasetShare[] | undefined;
  size?: number;
  type: {
    name: string;
    display: string;
    version: string;
  };
  fileCount?: number;
  status: UserDatasetVDI['status'];
  fileListing?: UserDatasetFileListing;
  importMessages: Array<string>;
  visibility?: UserDatasetVisibility;
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
  displayName: string;
  description: React.ReactNode;
  uploadTitle: string;
  formConfig: {
    name?: {
      inputProps: Partial<React.InputHTMLAttributes<HTMLInputElement>>;
    };
    summary?: {
      inputProps: Partial<React.InputHTMLAttributes<HTMLTextAreaElement>>;
    };
    description?: {
      inputProps: Partial<React.TextareaHTMLAttributes<HTMLTextAreaElement>>;
    };
    dependencies?: {
      label: ReactNode;
      render: (props: DependencyProps) => ReactNode;
      required?: boolean;
    };
    uploadMethodConfig: {
      file?: FileUploadConfig;
      url?: UrlUploadConfig;
      result?: ResultUploadConfig;
    };
    renderInfo?: () => ReactNode;
  };
}

export interface DependencyProps {
  value: UserDataset['dependencies'];
  onChange: (value: UserDataset['dependencies']) => void;
}

export interface FileUploadConfig {
  render?: (props: { fieldNode: ReactNode }) => ReactNode;
  maxSizeBytes?: number;
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
  dependencies?: UserDataset['dependencies'];
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

export type UserDatasetVisibility = TypeOf<typeof visibilityOptions>;

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

const userDatasetPublication = intersection([
  type({
    pubMedId: string,
  }),
  partial({
    citation: string,
  }),
]);

const userDatasetHyperlink = intersection([
  type({
    url: string,
    text: string,
  }),
  partial({
    description: string,
    isPublication: boolean,
  }),
]);

const userDatasetContact = intersection([
  type({
    name: string,
  }),
  partial({
    email: string,
    affiliation: string,
    city: string,
    state: string,
    country: string,
    address: string,
    isPrimary: boolean,
  }),
]);

const datasetDependency = type({
  resourceIdentifier: string,
  resourceDisplayName: string,
  resourceVersion: string,
});

// To do
// 1. Update this io-ts type. DONE :)
// 2. Find where response from getUserDataset is used
// 3. Update where it's used.

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
    dependencies: array(datasetDependency),
  }),
  partial({
    summary: string,
    description: string,
    sourceUrl: string,
    shares: array(userDatasetDetailsShareDetails),
    importMessages: array(string),
    shortName: string,
    shortAttribution: string,
    category: string,
    publications: array(userDatasetPublication),
    hyperlinks: array(userDatasetHyperlink),
    organisms: array(string),
    contacts: array(userDatasetContact),
    createdOn: string,
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

interface UserDatasetDependency {
  resourceIdentifier: string;
  resourceDisplayName: string;
  resourceVersion: string;
}

interface UserDatasetPublication {
  pubMedId: string;
  citation?: string;
}

interface UserDatasetHyperlink {
  url: string;
  text: string;
  description?: string;
  isPublication?: boolean;
}

interface UserDatasetContact {
  name: string;
  email?: string;
  affiliation?: string;
  city?: string;
  state?: string;
  country?: string;
  address?: string;
  isPrimary?: boolean;
}
export interface NewUserDatasetMeta {
  name: string;
  datasetType: {
    name: string;
    version: string;
  };
  shortName?: string;
  shortAttribution?: string;
  category?: string;
  visibility?: 'private' | 'public' | 'protected';
  summary?: string;
  description?: string;
  origin: string;
  projects: string[];
  dependencies: UserDatasetDependency[];
  publications?: UserDatasetPublication[];
  hyperlinks?: UserDatasetHyperlink[];
  organisms?: string[];
  contacts?: UserDatasetContact[];
  createdOn?: string;
}

export type UserDatasetVDI = TypeOf<typeof userDataset>;
export type UserDatasetDetails = TypeOf<typeof userDatasetDetails>;
export type UserQuotaMetadata = TypeOf<typeof userQuotaMetadata>;
export type UserDatasetFileListing = TypeOf<typeof userDatasetFileListing>;
export type UserDatasetInstallDetailsByProject = TypeOf<typeof installDetails>;
