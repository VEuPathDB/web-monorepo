import {
  makeActionCreator,
  InferAction,
} from '@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils';

import { FormSubmission } from '../Components/UploadForm';
import { UserDatasetUpload } from '../Utils/types';

export const submitUploadForm = makeActionCreator(
  'user-dataset-upload/submit-form',
  (formSubmission: FormSubmission, redirectTo?: string) => ({
    formSubmission,
    redirectTo,
  })
);

export const receiveBadUpload = makeActionCreator(
  'user-dataset-upload/receive-bad-upload',
  (message: string) => ({ message, timestamp: Date.now() })
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

export const receiveUploadMessages = makeActionCreator(
  'user-dataset-upload/receive-upload-messages',
  (uploads: Array<UserDatasetUpload>) => ({ uploads })
);

export const receiveBadUploadHistoryAction = makeActionCreator(
  'user-dataset-upload/receive-bad-upload-history-action',
  (message: string) => ({ message, timestamp: Date.now() })
);

export type Action =
  | InferAction<typeof submitUploadForm>
  | InferAction<typeof receiveBadUpload>
  | InferAction<typeof clearBadUpload>
  | InferAction<typeof cancelCurrentUpload>
  | InferAction<typeof clearMessages>
  | InferAction<typeof requestUploadMessages>
  | InferAction<typeof receiveUploadMessages>
  | InferAction<typeof receiveBadUploadHistoryAction>;
