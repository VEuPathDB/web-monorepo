import * as io from 'io-ts';

export const bioprojectId = io.intersection([
  io.type({ id: io.string }),
  io.partial({ description: io.string }),
]);
export type BioProjectId = io.TypeOf<typeof bioprojectId>;

export const sampleYearRange = io.type({
  start: io.number,
  end: io.number,
});
export type SampleYearRange = io.TypeOf<typeof sampleYearRange>;

export const datasetCharacteristics = io.partial({
  studyDesign: io.string,
  studyType: io.string,
  countries: io.array(io.string),
  years: sampleYearRange,
  studySpecies: io.array(io.string),
  outcomes: io.array(io.string),
  associatedFactors: io.array(io.string),
  participantAges: io.string,
  sampleTypes: io.array(io.string),
});
export type DatasetCharacteristics = io.TypeOf<typeof datasetCharacteristics>;

export const datasetContact = io.partial({
  firstName: io.string,
  middleName: io.string,
  lastName: io.string,
  isPrimary: io.boolean,
  email: io.string,
  affiliation: io.string,
  country: io.string,
});
export type DatasetContact = io.TypeOf<typeof datasetContact>;

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
export type DatasetUser = io.TypeOf<typeof partialUser>;

const datasetListShareUser = io.type({
  userId: io.number,
  firstName: io.string,
  lastName: io.string,
  affiliation: io.string,
  accepted: io.boolean,
});
export type DatasetListShareUser = io.TypeOf<typeof datasetListShareUser>;

const datasetUploadStatusCode = io.union([
  io.literal('running'),
  io.literal('success'),
  io.literal('rejected'),
  io.literal('failed'),
]);

const datasetUploadStatusInfo = io.intersection([
  io.type({ status: datasetUploadStatusCode }),
  io.partial({ message: io.string }),
]);
export type DatasetUploadStatusInfo = io.TypeOf<typeof datasetUploadStatusInfo>;

const datasetStatusInfo = io.intersection([
  io.type({ upload: datasetUploadStatusInfo }),
  io.partial({
    import: datasetImportStatusDetails,
    install: io.array(datasetInstallStatusMap),
  }),
]);
export type DatasetStatusInfo = io.TypeOf<typeof datasetStatusInfo>;

const datasetTypeOutput = io.type({
  name: io.string,
  version: io.string,
  category: io.string,
});
export type DatasetTypeOutput = io.TypeOf<typeof datasetTypeOutput>;

const datasetVisibility = io.union([
  io.literal('private'),
  io.literal('protected'),
  io.literal('public'),
  io.literal('controlled'),
]);
export type DatasetVisibility = io.TypeOf<typeof datasetVisibility>;

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
    fileCount: io.number,
    fileSizeTotal: io.number,
    created: io.string,
    summary: io.string,
  }),
  io.partial({
    shares: io.array(datasetListShareUser),
    description: io.string,
    originalId: io.string,
  }),
]);
export type DatasetListEntry = io.TypeOf<typeof datasetListEntry>;

export const datasetDependency = io.type({
  resourceIdentifier: io.string,
  resourceDisplayName: io.string,
  resourceVersion: io.string,
});
export type DatasetDependency = io.TypeOf<typeof datasetDependency>;

const datasetFileDetails = io.type({
  fileName: io.string,
  fileSize: io.number,
});

const datasetZipDetails = io.type({
  zipSize: io.number,
  contents: io.array(datasetFileDetails),
});

export const datasetFileListing = io.partial({
  upload: datasetZipDetails,
  install: datasetZipDetails,
  documents: io.array(datasetFileDetails),
  variableProperties: io.array(datasetFileDetails),
});
export type DatasetFileListing = io.TypeOf<typeof datasetFileListing>;

export const datasetFundingAward = io.type({
  agency: io.string,
  awardNumber: io.string,
});
export type DatasetFundingAward = io.TypeOf<typeof datasetFundingAward>;

export const datasetHyperlink = io.intersection([
  io.type({ url: io.string }),
  io.partial({ description: io.string }),
]);
export type DatasetHyperlink = io.TypeOf<typeof datasetHyperlink>;

export const datasetOrganism = io.type({
  species: io.string,
  strain: io.string,
});
export type DatasetOrganism = io.TypeOf<typeof datasetOrganism>;

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
export type DatasetPublication = io.TypeOf<typeof datasetPublication>;

export const doiReference = io.intersection([
  io.type({ doi: io.string }),
  io.partial({ description: io.string }),
]);
export type DOIReference = io.TypeOf<typeof doiReference>;

export const externalIdentifiers = io.partial({
  dois: io.array(doiReference),
  hyperlinks: io.array(datasetHyperlink),
  bioprojectIds: io.array(bioprojectId),
});
export type ExternalIdentifiers = io.TypeOf<typeof externalIdentifiers>;

export const linkedDataset = io.type({
  datasetUri: io.string,
  sharesRecords: io.boolean,
});
export type LinkedDataset = io.TypeOf<typeof linkedDataset>;

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

const datasetSource = io.type({
  url: io.string,
  version: io.string,
});
export type DatasetSource = io.TypeOf<typeof datasetSource>;

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
    datasetCharacteristics: datasetCharacteristics,
    externalIdentifiers: externalIdentifiers,
    funding: io.array(datasetFundingAward),
    shortAttribution: io.string,
    daysForApproval: io.number,
    dataDisclaimer: io.string,
    datasetSources: io.array(datasetSource),
  }),
]);
export type DatasetMetaBase = io.TypeOf<typeof datasetMetaBase>;

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
export type ShareOfferAction = io.TypeOf<typeof shareOfferAction>;

export const shareOffer = io.type({
  recipient: partialUser,
  status: shareOfferAction,
});
export type DatasetShareOffer = io.TypeOf<typeof shareOffer>;

export const datasetIdType = io.string;
export type DatasetId = io.TypeOf<typeof datasetIdType>;

export const userMetadata = io.type({
  quota: io.type({
    limit: io.number,
    usage: io.number,
  }),
});
export type VdiUserMetadata = io.TypeOf<typeof userMetadata>;

// region Service Config Endpoint

const vdiApiConfig = io.type({
  maxUploadSize: io.number,
  userMaxStorageSize: io.number,
});
export type VdiApiConfig = io.TypeOf<typeof vdiApiConfig>;

const vdiReconcilerConfig = io.intersection([
  io.type({
    enabled: io.boolean,
    fullRunInterval: io.string,
  }),
  io.record(io.string, io.any),
]);
export type VdiReconcilerConfig = io.TypeOf<typeof vdiReconcilerConfig>;

const vdiDaemonConfig = io.intersection([
  io.type({ reconciler: vdiReconcilerConfig }),
  io.record(io.string, io.any),
]);

const vdiInstallTarget = io.type({
  id: io.string,
  name: io.string,
});

const serviceConfiguration = io.type({
  api: vdiApiConfig,
  daemons: vdiDaemonConfig, // not relevant for public client use
  installTargets: io.array(vdiInstallTarget),
});
export type VdiServiceConfig = io.TypeOf<typeof serviceConfiguration>;

export const serviceFeatures = io.type({
  supportedArchiveTypes: io.array(io.string),
});
export type VdiServiceFeatures = io.TypeOf<typeof serviceFeatures>;

export const serviceMetadata = io.type({
  buildInfo: io.any, // not relevant for public client use
  configuration: serviceConfiguration,
  features: serviceFeatures,
});
export type VdiServiceMetadata = io.TypeOf<typeof serviceMetadata>;

// endregion Service Config Endpoint

export const shareOfferStatus = io.union([
  io.literal('open'),
  io.literal('accepted'),
  io.literal('rejected'),
]);
export const shareOfferListEntry = io.type({
  datasetId: datasetIdType,
  owner: partialUser,
  shareStatus: shareOfferStatus,
  type: datasetTypeOutput,
  installTargets: io.array(io.string),
});
export type ShareOfferListEntry = io.TypeOf<typeof shareOfferListEntry>;

export const pluginDataType = io.intersection([
  datasetTypeOutput,
  io.type({
    maxFileSize: io.number,
    usesDataProperties: io.boolean,
    allowedFileExtensions: io.array(io.string),
  }),
]);
export type PluginDataType = io.TypeOf<typeof pluginDataType>;

export const pluginListItem = io.intersection([
  io.type({
    pluginName: io.string,
    dataTypes: io.array(pluginDataType),
  }),
  io.partial({
    installTargets: io.array(io.string),
  }),
]);
export type VdiPluginConfig = io.TypeOf<typeof pluginListItem>;

// region Responses

// region Service Errors

/**
 * Container core error codes that do not offer information in addition to a
 * `message` property.
 *
 * This union specifically excludes the statuses `invalid-input` (422) and
 * `server-error` (500).
 */
const simpleContainerCoreErrorCode = io.union([
  io.literal('bad-request'),
  io.literal('unauthorized'),
  io.literal('forbidden'),
  io.literal('not-found'),
  io.literal('bad-method'),
  io.literal('conflict'),
  io.literal('gone'),
  // io.literal('invalid-input'), -- request error messages provided
  io.literal('failed-dependency'),
  io.literal('too-early'),
  // io.literal('server-error'), -- request id should be provided
]);

const simpleContainerCoreErrorBody = io.intersection([
  io.type({ status: simpleContainerCoreErrorCode }),
  io.partial({ message: io.string }),
]);
export type SimpleServiceErrorBody = io.TypeOf<
  typeof simpleContainerCoreErrorBody
>;

const ccServerErrorBody = io.intersection([
  io.type({
    status: io.literal('server-error'),
    requestId: io.string,
  }),
  io.partial({ message: io.string }),
]);
export type ServerErrorBody = io.TypeOf<typeof ccServerErrorBody>;

const ccValidationErrors = io.type({
  general: io.array(io.string),
  byKey: io.record(io.string, io.array(io.string)),
});
export type ValidationErrors = io.TypeOf<typeof ccValidationErrors>;

const ccValidationErrorBody = io.intersection([
  io.type({
    status: io.literal('invalid-input'),
    errors: ccValidationErrors,
  }),
  io.partial({ message: io.string }),
]);
export type ValidationErrorBody = io.TypeOf<typeof ccValidationErrorBody>;

export const ccErrorBodyUnion = io.union([
  ccValidationErrorBody,
  simpleContainerCoreErrorBody,
  ccServerErrorBody,
]);
export type ServiceError = io.TypeOf<typeof ccErrorBodyUnion>;

// endregion Service Errors

// region Success Responses

export const datasetGetResponseBody = io.intersection([
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
export type DatasetGetResponseBody = io.TypeOf<typeof datasetGetResponseBody>;

export const datasetPostResponseBody = io.type({ datasetId: datasetIdType });
export type DatasetPostResponseBody = io.TypeOf<typeof datasetPostResponseBody>;
export type DatasetPutResponseBody = DatasetPostResponseBody;

// endregion Success Responses

// region Service Responses

export const datasetPostResponse = io.union([
  datasetPostResponseBody,
  ccValidationErrorBody,
  simpleContainerCoreErrorBody,
  ccServerErrorBody,
]);
export type DatasetPostResponse = io.TypeOf<typeof datasetPostResponse>;

// endregion Service Responses

// endregion Responses
