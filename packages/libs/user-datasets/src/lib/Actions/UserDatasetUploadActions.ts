import {
  makeActionCreator,
  InferAction,
} from '@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils';
import { BadUpload, DatasetFormState } from '../StoreModules';
import { PartialDatasetDetails } from '../Service';
import { DatasetPublicationLookupResult } from '../StoreModules/UserDatasetUploadStoreModule';

export const trackUploadProgress = makeActionCreator(
  'user-dataset-upload/upload-progress',
  (progress: number | null) => ({ progress })
);

export const receiveBadUpload = makeActionCreator(
  'user-dataset-upload/receive-bad-upload',
  (response: BadUpload[]) => response
);

export const clearBadUpload = makeActionCreator(
  'user-dataset-upload/clear-bad-upload',
  () => ({})
);

export const cancelCurrentUpload = makeActionCreator(
  'user-dataset-upload/cancel-upload',
  (id: string) => ({ id })
);

export const clearMessages = makeActionCreator(
  'user-dataset-upload/clear-messages',
  (ids: string[]) => ({ ids })
);

export const requestUploadMessages = makeActionCreator(
  'user-dataset-upload/load-upload-messages',
  () => {}
);

export const receiveBadUploadHistoryAction = makeActionCreator(
  'user-dataset-upload/receive-bad-upload-history-action',
  (message: string) => ({ message, timestamp: Date.now() })
);

export const updateFormState = makeActionCreator(
  'user-dataset-upload/update-form-state',
  (formState: DatasetFormState) => formState
);

export const updateFormMetadata = makeActionCreator(
  'user-dataset-form/update-dataset-metadata',
  (metadata: PartialDatasetDetails) => metadata
);

export const CitationRequested = makeActionCreator(
  'user-dataset-form/citation-requested',
  (id: string): Record<string, DatasetPublicationLookupResult> => ({
    [id]: { status: 'pending' },
  })
);

export const CitationFound = makeActionCreator(
  'user-dataset-form/citation-found',
  (
    id: string,
    content: string
  ): Record<string, DatasetPublicationLookupResult> => ({
    [id]: { status: 'complete', content },
  })
);

export const CitationNotFound = makeActionCreator(
  'user-dataset-form/citation-not-found',
  (id: string): Record<string, DatasetPublicationLookupResult> => ({
    [id]: { status: 'not-found' },
  })
);

export const CitationLookupFailed = makeActionCreator(
  'user-dataset-form/citation-lookup-error',
  (
    id: string,
    error: Error
  ): Record<string, DatasetPublicationLookupResult> => ({
    [id]: { status: 'failed', error },
  })
);

export type Action =
  | InferAction<typeof trackUploadProgress>
  | InferAction<typeof receiveBadUpload>
  | InferAction<typeof clearBadUpload>
  | InferAction<typeof cancelCurrentUpload>
  | InferAction<typeof clearMessages>
  | InferAction<typeof requestUploadMessages>
  | InferAction<typeof receiveBadUploadHistoryAction>
  | InferAction<typeof updateFormState>
  | InferAction<typeof updateFormMetadata>
  | InferAction<typeof CitationRequested>
  | InferAction<typeof CitationFound>
  | InferAction<typeof CitationNotFound>
  | InferAction<typeof CitationLookupFailed>;
