import { makeActionCreator } from '@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils';
export const submitUploadForm = makeActionCreator(
  'user-dataset-upload/submit-form',
  (formSubmission, redirectTo) => ({
    formSubmission,
    redirectTo,
  })
);
export const receiveBadUpload = makeActionCreator(
  'user-dataset-upload/receive-bad-upload',
  (message) => ({ message, timestamp: Date.now() })
);
export const clearBadUpload = makeActionCreator(
  'user-dataset-upload/clear-bad-upload',
  () => ({})
);
export const cancelCurrentUpload = makeActionCreator(
  'user-dataset-upload/cancel-upload',
  (id) => ({ id })
);
export const clearMessages = makeActionCreator(
  'user-dataset-upload/clear-messages',
  (ids) => ({ ids })
);
export const requestUploadMessages = makeActionCreator(
  'user-dataset-upload/load-upload-messages',
  () => {}
);
export const receiveUploadMessages = makeActionCreator(
  'user-dataset-upload/receive-upload-messages',
  (uploads) => ({ uploads })
);
export const receiveBadUploadHistoryAction = makeActionCreator(
  'user-dataset-upload/receive-bad-upload-history-action',
  (message) => ({ message, timestamp: Date.now() })
);
//# sourceMappingURL=UserDatasetUploadActions.js.map
