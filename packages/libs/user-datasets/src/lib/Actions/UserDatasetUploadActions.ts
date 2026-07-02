import {
  makeActionCreator,
  InferAction,
} from '@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils';
import { BadUpload, DatasetFormState } from '../StoreModules';
import { PartialDatasetDetails } from '../Service';

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
  (metadata: PartialDatasetDetails) => metadata,
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
  | InferAction<typeof updateFormMetadata>;
