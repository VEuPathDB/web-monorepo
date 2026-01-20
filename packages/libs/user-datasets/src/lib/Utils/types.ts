import React, { ReactNode } from 'react';

import {
  TypeOf,
  array,
  intersection,
  number,
  type,
  partial,
  string,
} from 'io-ts';

import * as io from 'io-ts';

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

const datasetInstallStatusEntry = io.intersection([
  io.type({ status: datasetInstallStatus }),
  io.partial({ messages: io.array(io.string) }),
]);

export const datasetInstallStatusMap = io.intersection([
  io.type({
    installTarget: io.string,
    meta: datasetInstallStatusEntry,
  }),
  io.partial({ data: datasetInstallStatusEntry }),
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
  io.partial({ install: io.array(datasetInstallStatusMap) }),
]);

export const datasetTypeInput = io.type({
  name: io.string,
  version: io.string,
});

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
});

export const revisionHistory = io.type({
  originalId: io.string,
  revisions: io.array(datasetRevision),
});

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
  io.literal('project-name'),
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

export const datasetPostDetails = io.intersection([
  datasetMetaBase,
  io.type({
    type: datasetTypeInput,
  }),
  io.partial({ visibility: datasetVisibility }),
]);

export type DatasetDependency = io.TypeOf<typeof datasetDependency>;
export type DatasetDetails = io.TypeOf<typeof datasetDetails>;
export type DatasetFileDetails = io.TypeOf<typeof datasetFileDetails>;
export type DatasetListEntry = io.TypeOf<typeof datasetListEntry>;
export type DatasetListShareUser = io.TypeOf<typeof datasetListShareUser>;
export type DatasetPostDetails = io.TypeOf<typeof datasetPostDetails>;
export type DatasetShareOffer = io.TypeOf<typeof shareOffer>;
export type DatasetStatusInfo = io.TypeOf<typeof datasetStatusInfo>;
export type DatasetTypeOutput = io.TypeOf<typeof datasetTypeOutput>;
export type DatasetUser = io.TypeOf<typeof partialUser>;

export type PatchValue<T> = {
  value: T | null;
}

export type DatasetPatchBody = Record<string, PatchValue<unknown>>

/**
 * Union type for compatibility between the VDI API and legacy code based on the
 * User Dataset Install Service.
 */
export type LegacyCompatDatasetType = DatasetListEntry | DatasetDetails;

export type ZipFileType = 'upload' | 'install';

////////////////////////////////////////////////////////////////////////////////

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
  value: DatasetDependency[];
  onChange: (value: DatasetDependency[]) => void;
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

export interface NewUserDataset {
  details: Partial<DatasetPostDetails>;
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
/**
 * In EDA, data is referred to as "Study" or "Studies"
 * In genomics, data is referred to as "Data Set" or "Data Sets"
 */
export type DataNoun = {
  singular: string;
  plural: string;
};

export const datasetIdType = type({ datasetId: string });

export type UserDatasetFormContent = TypeOf<typeof userDatasetFormContent>;
export const userDatasetFormContent = intersection([
  type({
    name: string,
    summary: string,
  }),
  partial({
    shortAttribution: string,
    description: string,
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
