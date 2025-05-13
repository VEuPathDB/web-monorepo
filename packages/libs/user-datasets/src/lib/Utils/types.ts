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

// User dataset metadata type used by the UI (as opposed to the type
// used by VDI).
export interface UserDatasetMeta_UI extends UserDatasetFormContent {
  visibility: UserDatasetVisibility;
  createdOn?: string;
}

// Interface for the dataset metadata used by VDI. Will get transformed into
// UserDatasetMeta_UI for the the client.
export interface UserDatasetMeta_VDI extends UserDatasetFormContent {
  datasetType: {
    name: string;
    version: string;
  };
  visibility?: UserDatasetVisibility;
  origin: string;
  projects: string[];
  dependencies: UserDatasetDependency[];
  createdOn?: string;
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
  meta: UserDatasetMeta_UI;
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

export interface NewUserDataset extends UserDatasetMeta_UI {
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

export type UserDatasetPublication = TypeOf<typeof userDatasetPublication>;
const userDatasetPublication = intersection([
  type({
    pubMedId: string,
  }),
  partial({
    citation: string,
  }),
]);

export type UserDatasetHyperlink = TypeOf<typeof userDatasetHyperlink>;
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

export type UserDatasetContact = TypeOf<typeof userDatasetContact>;
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

export const studyDesignOptions = {
  'Cluster-randomized controlled trial': null,
  'Quasi-experimental study': null,
  'Randomized controlled/clinical trial': null,
  'Case series study': null,
  'Case-control study': null,
  'Cohort study': null,
  'Cross-sectional study': null,
  'Ecological study': null,
  'Panel study': null,
  'Surveillance study': null,
  'Meta-analysis': null,
  Other: null,
};

export type UserDatasetCharacteristics = TypeOf<
  typeof userDatasetCharacteristics
>;
export const userDatasetCharacteristics = partial({
  studyDesign: keyof(studyDesignOptions),
  studyType: string, // assigned by the backend
  disease: string,
  sampleType: string,
  country: string,
  years: string,
  ages: string,
});

export type UserDatasetFormContent = TypeOf<typeof userDatasetFormContent>;
export const userDatasetFormContent = intersection([
  type({
    name: string,
  }),
  partial({
    summary: string,
    shortName: string,
    shortAttribution: string,
    category: string,
    description: string,
    publications: array(userDatasetPublication),
    hyperlinks: array(userDatasetHyperlink),
    organisms: array(string),
    contacts: array(userDatasetContact),
    datasetCharacteristics: userDatasetCharacteristics,
  }),
]);

// Many of these user dataset details are in both the vdi and wdk user datasets.
// This base type defines the fields common to both.
const userDatasetDetails_base = intersection([
  datasetIdType,
  userDatasetFormContent,
  type({
    owner: ownerDetails,
    datasetType: datasetTypeDetails,
    visibility: visibilityOptions,
    origin: string,
    projectIds: array(string),
    status: statusDetails,
    created: string,
  }),
  partial({
    sourceUrl: string,
    importMessages: array(string),
    createdOn: string,
  }),
]);

export const userDatasetDetails_VDI = intersection([
  datasetIdType,
  userDatasetDetails_base,
  type({
    fileCount: number,
    fileSizeTotal: number,
  }),
  partial({
    shares: array(
      intersection([userDatasetRecipientDetails, type({ accepted: boolean })])
    ),
  }),
]);

const userDatasetDetailsShareDetails = type({
  status: keyof({ grant: null, revoke: null }),
  recipient: userDatasetRecipientDetails,
});

export type UserDatasetDependency = TypeOf<typeof userDatasetDependency>;
const userDatasetDependency = type({
  resourceIdentifier: string,
  resourceDisplayName: string,
  resourceVersion: string,
});

export const userDatasetDetails = intersection([
  datasetIdType,
  userDatasetDetails_base,
  type({
    dependencies: array(userDatasetDependency),
  }),
  partial({
    shares: array(userDatasetDetailsShareDetails),
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

export type UserDatasetVDI = TypeOf<typeof userDatasetDetails_VDI>;
export type UserDatasetDetails = TypeOf<typeof userDatasetDetails>;
export type UserQuotaMetadata = TypeOf<typeof userQuotaMetadata>;
export type UserDatasetFileListing = TypeOf<typeof userDatasetFileListing>;
export type UserDatasetInstallDetailsByProject = TypeOf<typeof installDetails>;
