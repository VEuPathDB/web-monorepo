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

import * as io from 'io-ts';

export const apiServiceConfiguration = io.type({
  maxUploadSize: io.number,
  userMaxStorageSize: io.number,
});

export const bioprojectIDReference = io.intersection([
  io.type({ id: io.string }),
  io.partial({ description: io.string }),
]);

export const sampleYearRange = io.type({
  start: io.number,
  end: io.number,
});

export const datasetCharacteristics = io.partial({
  studyDesign: io.string,
  studyType: io.string,
  countries: io.array(io.string),
  years: sampleYearRange,
  studySpecies: io.array(io.string),
  diseases: io.array(io.string),
  associatedFactors: io.array(io.string),
  participantAges: io.string,
  sampleTypes: io.array(io.string),
});

export const datasetContact = io.partial({
  firstName: io.string,
  middleName: io.string,
  lastName: io.string,
  isPrimary: io.boolean,
  email: io.string,
  affiliation: io.string,
  country: io.string,
});

export const datasetImportStatus = io.union([
  io.literal('queued'),
  io.literal('in-progress'),
  io.literal('complete'),
  io.literal('invalid'),
  io.literal('failed'),
]);

export const datasetImportStatusDetails = io.intersection([
  io.type({ status: datasetImportStatus }),
  io.partial({ messages: io.array(io.string) }),
]);

export const datasetInstallStatus = io.union([
  io.literal('running'),
  io.literal('complete'),
  io.literal('failed-validation'),
  io.literal('failed-installation'),
  io.literal('ready-for-reinstall'),
  io.literal('missing-dependency'),
]);

export const datasetInstallStatusEntry = io.intersection([
  io.type({
    installTarget: io.string,
    metaStatus: datasetInstallStatus,
  }),
  io.partial({
    metaMessages: io.array(io.string),
    dataStatus: datasetInstallStatus,
    dataMessages: io.array(io.string),
  }),
]);

export const partialUser = io.intersection([
  io.type({ userId: io.number }),
  io.partial({
    firstName: io.string,
    lastName: io.string,
    email: io.string,
    affiliation: io.string,
  }),
]);

export const datasetListShareUser = io.type({
  userId: io.number,
  firstName: io.string,
  lastName: io.string,
  affiliation: io.string,
  accepted: io.boolean,
});

export const datasetStatusInfo = io.intersection([
  io.type({ import: datasetImportStatusDetails }),
  io.partial({ install: io.array(datasetInstallStatusEntry) }),
]);

export const datasetTypeOutput = io.type({
  name: io.string,
  version: io.string,
  category: io.string,
});

export const datasetVisibility = io.union([
  io.literal('private'),
  io.literal('protected'),
  io.literal('public'),
  io.literal('controlled'),
]);

export const datasetListEntry = io.intersection([
  io.type({
    datasetId: io.string,
    owner: partialUser,
    type: datasetTypeOutput,
    visibility: datasetVisibility,
    name: io.string,
    origin: io.string,
    installTargets: io.array(io.string),
    status: datasetStatusInfo,
    shares: io.array(datasetListShareUser),
    fileCount: io.number,
    fileSizeTotal: io.number,
    created: io.string,
    summary: io.string,
  }),
  io.partial({
    description: io.string,
    originalId: io.string,
  }),
]);

export const datasetDependency = io.type({
  resourceIdentifier: io.string,
  resourceDisplayName: io.string,
  resourceVersion: io.string,
});

const datasetFileDetails = io.type({
  fileName: io.string,
  fileSize: io.number,
});

const datasetZipDetails = io.type({
  zipSize: io.number,
  contents: io.array(datasetFileDetails),
});

export const datasetFileListing = io.intersection([
  io.type({ upload: datasetZipDetails }),
  io.partial({
    install: datasetZipDetails,
    documents: io.array(datasetFileDetails),
    variableProperties: io.array(datasetFileDetails),
  }),
]);

export const datasetFundingAward = io.type({
  agency: io.string,
  awardNumber: io.string,
});

export const datasetHyperlink = io.intersection([
  io.type({ url: io.string }),
  io.partial({ description: io.string }),
]);

export const datasetOrganism = io.type({
  species: io.string,
  strain: io.string,
});

export const datasetPublicationType = io.union([
  io.literal('pmid'),
  io.literal('doi'),
]);

export const datasetPublication = io.intersection([
  io.type({
    identifier: io.string,
  }),
  io.partial({
    type: datasetPublicationType,
    isPrimary: io.boolean,
  }),
]);

export const doiReference = io.intersection([
  io.type({ doi: io.string }),
  io.partial({ description: io.string }),
]);

export const externalIdentifiers = io.partial({
  dois: io.array(doiReference),
  hyperlinks: io.array(datasetHyperlink),
  bioprojectIds: io.array(bioprojectIDReference),
});

export const linkedDataset = io.type({
  datasetUri: io.string,
  sharesRecords: io.boolean,
});

export const datasetRevisionAction = io.union([
  io.literal('create'),
  io.literal('extend'),
  io.literal('revise'),
]);

export const datasetRevision = io.type({
  action: datasetRevisionAction,
  timestamp: io.string,
  revisionId: io.string,
  revisionNote: io.string,
  fileListUrl: io.string,
})

export const revisionHistory = io.type({
  originalId: io.string,
  revisions: io.array(datasetRevision),
})

export const datasetMetaBase = io.intersection([
  io.type({
    installTargets: io.array(io.string),
    name: io.string,
    summary: io.string,
    origin: io.string,
    dependencies: io.array(datasetDependency),
  }),
  io.partial({
    description: io.string,
    publications: io.array(datasetPublication),
    contacts: io.array(datasetContact),
    projectName: io.string,
    programName: io.string,
    linkedDatasets: io.array(linkedDataset),
    experimentalOrganism: datasetOrganism,
    hostOrganism: datasetOrganism,
    studyCharacteristics: datasetCharacteristics,
    externalIdentifiers: externalIdentifiers,
    funding: io.array(datasetFundingAward),
    shortAttribution: io.string,
  }),
]);

export const relationType = io.union([
  io.literal('publication'),
  io.literal('program-name'),
  io.literal('project-name')
]);

export const relatedDatasetInfo = io.type({
  datasetId: io.string,
  type: datasetTypeOutput,
  name: io.string,
  summary: io.string,
  created: io.string,
  relatedBy: relationType,
});

export const shareOfferAction = io.union([
  io.literal('grant'),
  io.literal('revoke'),
]);

export const shareOffer = io.type({
  recipient: partialUser,
  status: shareOfferAction,
});

export const datasetDetails = io.intersection([
  datasetMetaBase,
  io.type({
    datasetId: io.string,
    type: datasetTypeOutput,
    visibility: datasetVisibility,
    owner: partialUser,
    created: io.string,
    shortName: io.string,
    status: datasetStatusInfo,
    files: datasetFileListing,
  }),
  io.partial({
    sourceUrl: io.string,
    revisionHistory: revisionHistory,
    relatedDatasets: io.array(relatedDatasetInfo),
    shares: io.array(shareOffer),
  }),
]);

export type APIServiceConfiguration = io.TypeOf<typeof apiServiceConfiguration>;
export type DatasetCharacteristics = io.TypeOf<typeof datasetCharacteristics>;
export type DatasetContact = io.TypeOf<typeof datasetContact>;
export type DatasetDependency = io.TypeOf<typeof datasetDependency>;
export type DatasetDetails = io.TypeOf<typeof datasetDetails>;
export type DatasetFileDetails = io.TypeOf<typeof datasetFileDetails>;
export type DatasetFileListing = io.TypeOf<typeof datasetFileListing>;
export type DatasetFundingAward = io.TypeOf<typeof datasetFundingAward>;
export type DatasetImportStatus = io.TypeOf<typeof datasetImportStatus>;
export type DatasetInstallStatus = io.TypeOf<typeof datasetInstallStatus>;
export type DatasetInstallStatusEntry = io.TypeOf<
  typeof datasetInstallStatusEntry
>;
export type DatasetListEntry = io.TypeOf<typeof datasetListEntry>;
export type DatasetListShareUser = io.TypeOf<typeof datasetListShareUser>;
export type DatasetOrganism = io.TypeOf<typeof datasetOrganism>;
export type DatasetOwner = io.TypeOf<typeof partialUser>;
export type DatasetPublication = io.TypeOf<typeof datasetPublication>;
export type DatasetPublicationType = io.TypeOf<typeof datasetPublicationType>;
export type DatasetStatusInfo = io.TypeOf<typeof datasetStatusInfo>;
export type DatasetTypeOutput = io.TypeOf<typeof datasetTypeOutput>;
export type DatasetVisibility = io.TypeOf<typeof datasetVisibility>;
export type LinkedDataset = io.TypeOf<typeof linkedDataset>;
export type RelatedDatasetInfo = io.TypeOf<typeof relatedDatasetInfo>;

////////////////////////////////////////////////////////////////////////////////

// User dataset metadata type used by the UI (as opposed to the type
// used by VDI).
export interface UserDatasetMeta_UI extends UserDatasetFormContent {
  visibility: DatasetVisibility;
  createdOn?: string;
}

// Interface for the dataset metadata used by VDI. Will get transformed into
// UserDatasetMeta_UI for the the client.
export interface UserDatasetMeta_VDI extends UserDatasetFormContent {
  datasetType: {
    name: string;
    version: string;
  };
  visibility?: DatasetVisibility;
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
  fileListing?: DatasetFileListing;
  importMessages: Array<string>;
  visibility?: DatasetVisibility;
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
    hideRelatedOrganisms?: boolean;
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
  T2 extends string = string,
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

export const userDatasetDetails_VDI = intersection([
  datasetIdType,
  userDatasetDetails_base,
  type({
    fileCount: number,
    fileSizeTotal: number,
  }),
  partial({
    shares: array(
      intersection([userDatasetRecipientDetails, type({ accepted: boolean })]),
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
