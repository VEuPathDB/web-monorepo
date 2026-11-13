export type { DatasetMetadata } from './metadata-decoder';

export type {
  DatasetCharacteristicsPatch,
  DatasetPatchRequest,
  DatasetPutDetails,
  ExternalIdentifiersPatch,
  GetDatasetsQueryParamEnum,
  OptionalValuePatch,
  PartialCharacteristics,
  PartialDatasetContact,
  PartialDatasetDetails,
  PartialDatasetPublication,
  PartialDatasetSource,
  ShareReceiptAction,
} from './request-types';

export type {
  BioProjectId,
  DatasetContact,
  DatasetDependency,
  DatasetFileDetails,
  DatasetFileListing,
  DatasetGetResponseBody,
  DatasetHyperlink,
  DatasetId,
  DatasetListEntry,
  DatasetListShareUser,
  DatasetMetadataContentFlags,
  DatasetPatchResponse,
  DatasetPostResponse,
  DatasetPostResponseBody,
  DatasetPropertiesDeleteResponse,
  DatasetPublication,
  DatasetPublicationType,
  DatasetPutResponseBody,
  DatasetShareOffer,
  DatasetStatusInfo,
  DatasetTypeOutput,
  DatasetUploadStatusInfo,
  DatasetUser,
  DatasetVisibility,
  DOIReference,
  ExternalIdentifiers,
  PluginDataType,
  RawDatasetMetadataResponse,
  SampleYearRange,
  ServerErrorBody,
  ShareOfferAction,
  ShareOfferListEntry,
  SimpleServiceErrorBody,
  ValidationErrors,
  ValidationErrorBody,
  VdiErrorCode,
  VdiPluginConfig,
  VdiReconcilerConfig,
  VdiServiceConfig,
  VdiServiceMetadata,
  VdiServiceFeatures,
  VdiUserMetadata,
} from './response-decoders';

export type {
  UploadContent,
  FileUploadContent,
  TextUploadContent,
} from './upload-content';
export { newUploadContent } from './upload-content';

export type { DatasetUploads, DatasetZipType } from './utility-types';
export {
  newDatasetUploads,
  type UploadContentMap,
} from './utility-types';
