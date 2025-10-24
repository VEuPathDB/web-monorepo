import * as io from "io-ts";
import * as vdi from "./service-types";
import * as dataset from "./metadata-types";
import { pluginDetails, serviceBuildInfo, serviceConfiguration } from "./service-types";


// region GET /datasets

export const datasetsListEntry = io.intersection([
  io.type({
    datasetId: io.string,
    owner: io.number,
    datasetType: dataset.datasetType,
    visibility: dataset.visibilityEnum,
    name: io.string,
    origin: io.string,
    installTargets: io.array(io.string),
    status: vdi.datasetStatusInfo,
    created: io.string,
    isDeleted: io.boolean,
    summary: io.string,
  }),
  io.partial({
    description: io.string,
    programName: io.string,
    projectName: io.string,
  }),
]);
export type DatasetListEntry = io.TypeOf<typeof datasetsListEntry>;

const allDatasetsListMeta = io.type({
  count: io.number,
  offset: io.number,
  limit: io.number,
  total: io.number,
});
export type AllDatasetsListMeta = io.TypeOf<typeof allDatasetsListMeta>;

const allDatasetsListResponse = io.type({
  meta: allDatasetsListMeta,
  results: io.array(datasetsListEntry),
});
export type AllDatasetsListResponse = io.TypeOf<typeof allDatasetsListResponse>;

// endregion GET /datasets

// region POST /datasets

const inputDatasetType = io.type({
  name: io.string,
  version: io.string,
});

export type InputDatasetType = io.TypeOf<typeof inputDatasetType>;

const createDatasetRequest = io.intersection([
  dataset.baseMetadata,
  io.type({
    type: inputDatasetType,
    origin: io.string,
  }),
  io.partial({ visibility: dataset.visibilityEnum }),
]);

export type DatasetPostRequest = io.TypeOf<typeof createDatasetRequest>;

export const postDatasetSuccessResponse = io.type({ datasetId: io.string });

export type DatasetPostSuccessResponse = io.TypeOf<typeof postDatasetSuccessResponse>;

// endregion POST /datasets

// region /datasets/{vdi-id}

// region GET /datasets/{vdi-id}


export const datasetDetails = io.intersection([
  dataset.baseMetadata,
  io.type({
    datasetId: io.string,
    type: dataset.datasetType,
    visibility: dataset.visibilityEnum,
    owner: vdi.userInfo,
    created: io.string,
    shortName: io.string,
    status: vdi.datasetStatusInfo,
  }),
  io.partial({
    sourceUrl: io.string,
    revisionHistory: dataset.revisionHistory,
    relatedDatasets: io.array(vdi.relatedDataset),
    importMessages: io.array(io.string),
    shares: io.array(vdi.shareOffer),
  }),
]);

export type DatasetDetails = io.TypeOf<typeof datasetDetails>;

// endregion GET /datasets/{vdi-id}

// region PATCH /datasets/{vdi-id}

/**
 * Creates an io-ts type definition for a patch container object wrapping the
 * given type definition.
 *
 * @param definition io-ts type definition for the field type.
 *
 * @return io-ts type definition for a patch container object wrapping the given
 * type definition.
 */
function patchContainer<T extends io.Type<A>, A = any>(definition: T): io.TypeC<{ value: T }> {
  return io.type({ value: definition });
}

/**
 * Creates an io-ts type definition for a patch container object with a nullable
 * value.
 *
 * Used for fields that may be patched with `null` to remove the field from the
 * parent record.
 *
 * @param definition io-ts type definition for the nullable field type.
 *
 * @return io-ts type definition for a patch container object wrapping a union
 * of the given definition type and `null`.
 */
function optionalPatchContainer<T extends io.Type<A>, A = any>(definition: T): io.TypeC<{
  value: io.UnionC<[ T, io.NullC ]>
}> {
  return patchContainer(io.union([ definition, io.null ]));
}

const stringPatch = patchContainer(io.string);
const optionalStringPatch = optionalPatchContainer(io.string);
const optionalStringArrayPatch = optionalPatchContainer(io.array(io.string));

const datasetCharacteristicsPatch = io.partial({
  studyDesign: optionalStringPatch,
  studyType: optionalStringPatch,
  countries: optionalStringArrayPatch,
  years: optionalPatchContainer(dataset.yearRange),
  studySpecies: optionalStringArrayPatch,
  diseases: optionalStringArrayPatch,
  associatedFactors: optionalStringArrayPatch,
  participantAges: optionalStringPatch,
  sampleTypes: optionalStringArrayPatch,
});

const externalIdentifiersPatch = io.partial({
  dois: optionalPatchContainer(io.array(dataset.doi)),
  hyperlinks: optionalPatchContainer(io.array(dataset.hyperlink)),
  bioprojectIds: optionalPatchContainer(io.array(dataset.bioprojectId)),
});

const datasetPatchRequest = io.partial({
  type: patchContainer(vdi.partialDatasetType),
  visibility: patchContainer(dataset.visibilityEnum),
  name: stringPatch,
  summary: stringPatch,
  description: optionalStringPatch,
  publications: optionalPatchContainer(io.array(dataset.publication)),
  contacts: optionalPatchContainer(io.array(dataset.contact)),
  projectName: optionalStringPatch,
  programName: optionalStringPatch,
  linkedDatasets: optionalPatchContainer(io.array(dataset.linkedDataset)),
  experimentalOrganism: optionalPatchContainer(dataset.organism),
  hostOrganism: optionalPatchContainer(dataset.organism),
  characteristics: datasetCharacteristicsPatch,
  externalIdentifiers: externalIdentifiersPatch,
  funding: optionalPatchContainer(io.array(dataset.fundingAward)),
  shortAttribution: optionalStringPatch,
});

export type DatasetPatchRequest = io.TypeOf<typeof datasetPatchRequest>;

// endregion PATCH /datasets/{vdi-id}

// region PUT /datasets/{vdi-id}

const datasetPutRequest = io.intersection([
  datasetPatchRequest,
  io.type({
    origin: io.string,
    revisionNote: io.string,
  }),
]);

export type DatasetPutRequest = io.TypeOf<typeof datasetPutRequest>;

// endregion PUT /datasets/{vdi-id}

// region GET /datasets/{vdi-id}/files

const datasetFileDetails = io.type({
  fileName: io.string,
  fileSize: io.number,
});

export type DatasetFileDetails = io.TypeOf<typeof datasetFileDetails>;

const datasetZipDetails = io.type({
  zipSize: io.number,
  contents: io.array(datasetFileDetails),
});

export type DatasetZipDetails = io.TypeOf<typeof datasetZipDetails>;

const datasetFileListResponse = io.intersection([
  io.type({ upload: datasetZipDetails }),
  io.partial({
    install: datasetZipDetails,
    documents: io.array(datasetFileDetails),
  }),
]);

export type DatasetFileListResponse = io.TypeOf<typeof datasetFileListResponse>;

// endregion GET /datasets/{vdi-id}/files

// region PUT /datasets/{vdi-id}/shares/{user-id}/offer

const shareOfferPutRequest = io.type({ action: vdi.shareOfferActionEnum });

export type ShareOfferPutRequest = io.TypeOf<typeof shareOfferPutRequest>;

// endregion PUT /datasets/{vdi-id}/shares/{user-id}/offer

// region PUT /datasets/{vdi-id}/shares/{user-id}/receipt

const shareReceiptPutRequest = io.type({ action: vdi.shareReceiptActionEnum });

export type ShareReceiptPutRequest = io.TypeOf<typeof shareReceiptPutRequest>;

// endregion PUT /datasets/{vdi-id}/shares/{user-id}/receipt

// endregion /datasets/{vdi-id}

// region GET /datasets/community

const communityDataset = io.intersection([
  dataset.importedBaseMetadata,
  io.type({
    owner: vdi.userInfo,
    status: vdi.datasetStatusInfo,
  }),
  io.partial({
    importMessages: io.array(io.string),
    relatedDatasets: io.array(vdi.relatedDataset),
    shares: io.array(vdi.shareOffer),
  }),
]);
export type CommunityDataset = io.TypeOf<typeof communityDataset>;

// endregion GET /datasets/community

// region /users/self/meta

const userUsageQuota = io.type({
  limit: io.number,
  usage: io.number,
});
export type VdiUserUsageQuota = io.TypeOf<typeof userUsageQuota>;

const userMetadata = io.type({ quota: userUsageQuota });
export type VdiUserMetadata = io.TypeOf<typeof userMetadata>;

// endregion /users/self/meta

// region /users/self/share-offers

const shareOfferStatusEnum = io.union([
  io.literal("open"),
  io.literal("accepted"),
  io.literal("rejected"),
]);

const shareOfferDetails = io.type({
  datasetId: io.string,
  owner: vdi.userInfo,
  shareStatus: shareOfferStatusEnum,
  type: dataset.datasetType,
  installTargets: io.array(io.string),
});
export type UserShareOffer = io.TypeOf<typeof shareOfferDetails>;

// endregion /users/self/share-offers

// region GET /plugins

export const pluginDetailsResponse = io.array(pluginDetails);

export type PluginDetailsResponse = io.TypeOf<typeof pluginDetailsResponse>;

// endregion GET /plugins

// region GET /meta-info

export const serviceMetadataResponseBody = io.type({
  buildInfo: serviceBuildInfo,
  configuration: serviceConfiguration,
});

export type ServiceMetadataResponseBody = io.TypeOf<typeof serviceMetadataResponseBody>;

// endregion GET /meta-info