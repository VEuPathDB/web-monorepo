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
} from "io-ts";
import { DatasetDependency, DatasetPostRequest, DatasetVisibility } from "../Service/Types";
import { DatasetInstaller, DisplayTextOverride } from "@veupathdb/web-common/src/user-dataset-upload-config";
import { ServiceConfiguration } from "../Service/Types/service-types";
import { ReactNode } from "react";

export type ShareContext = "datasetDetails" | "datasetsList";

export type VDIConfig = ServiceConfiguration;

// User dataset metadata type used by the UI (as opposed to the type
// used by VDI).
export interface UserDatasetMeta_UI extends UserDatasetFormContent {
  visibility: UserDatasetVisibility;
  createdOn?: string;
}

// Interface for the dataset metadata used by VDI. Will get transformed into
// UserDatasetMeta_UI for the client.
export interface UserDatasetShare {
  time?: number;
  user: number;
  email?: string;
  userDisplayName: string;
}

export interface UserDataset {
  created: number | string;
  age: number;
  dependencies?: Array<DatasetDependency>;
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
  // status: UserDatasetVDI["status"];
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

export interface DatasetVisibilityOption {
  readonly value: DatasetVisibility;
  readonly display: NonNullable<ReactNode>;
  readonly description: () => NonNullable<ReactNode>;
}

export interface ResultUploadConfig {
  offerStrategyUpload: boolean;
  compatibleRecordTypes: CompatibleRecordTypes;
}

export type CompatibleRecordTypes = Record<
  string,
  { reportName: string; reportConfig: unknown }
>;

interface DisabledUploadPageConfig {
  readonly hasDirectUpload: false;
  readonly displayTextOverride?: DisplayTextOverride;
}

export interface EnabledUploadPageConfig {
  readonly hasDirectUpload: true;
  readonly availableUploadTypes: DatasetInstaller[];
  readonly displayTextOverride?: DisplayTextOverride;
}

export type DatasetUploadPageConfig = EnabledUploadPageConfig | DisabledUploadPageConfig;



export interface NewUserDataset extends DatasetPostRequest {
  uploadMethod:
    | { type: "file"; file: File; }
    | { type: "url"; url: string; }
    | {
    type: "result";
    stepId: number;
    reportName: string;
    reportConfig: unknown;
  };
}

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
  "failed-validation": null,
  "failed-installation": null,
  "ready-for-reinstall": null,
  "missing-dependency": null,
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
  "in-progress": null,
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

const userDatasetDetailsShareDetails = type({
  status: keyof({ grant: null, revoke: null }),
  recipient: userDatasetRecipientDetails,
});
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

export type UserDatasetFileListing = TypeOf<typeof userDatasetFileListing>;
