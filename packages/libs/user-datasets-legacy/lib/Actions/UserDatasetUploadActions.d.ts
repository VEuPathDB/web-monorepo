import { InferAction } from '@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils';
import { FormSubmission } from '../Components/UploadForm';
import { UserDatasetUpload } from '../Utils/types';
export declare const submitUploadForm: {
  (
    formSubmission: FormSubmission,
    redirectTo?: string | undefined
  ): import('@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils').Action<
    'user-dataset-upload/submit-form',
    {
      formSubmission: FormSubmission;
      redirectTo: string | undefined;
    }
  >;
  readonly type: 'user-dataset-upload/submit-form';
} & import('@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils').ActionTypeGuardContainer<
  import('@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils').Action<
    'user-dataset-upload/submit-form',
    {
      formSubmission: FormSubmission;
      redirectTo: string | undefined;
    }
  >
>;
export declare const receiveBadUpload: {
  (
    message: string
  ): import('@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils').Action<
    'user-dataset-upload/receive-bad-upload',
    {
      message: string;
      timestamp: number;
    }
  >;
  readonly type: 'user-dataset-upload/receive-bad-upload';
} & import('@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils').ActionTypeGuardContainer<
  import('@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils').Action<
    'user-dataset-upload/receive-bad-upload',
    {
      message: string;
      timestamp: number;
    }
  >
>;
export declare const clearBadUpload: {
  (): import('@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils').Action<
    'user-dataset-upload/clear-bad-upload',
    {}
  >;
  readonly type: 'user-dataset-upload/clear-bad-upload';
} & import('@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils').ActionTypeGuardContainer<
  import('@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils').Action<
    'user-dataset-upload/clear-bad-upload',
    {}
  >
>;
export declare const cancelCurrentUpload: {
  (
    id: string
  ): import('@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils').Action<
    'user-dataset-upload/cancel-upload',
    {
      id: string;
    }
  >;
  readonly type: 'user-dataset-upload/cancel-upload';
} & import('@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils').ActionTypeGuardContainer<
  import('@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils').Action<
    'user-dataset-upload/cancel-upload',
    {
      id: string;
    }
  >
>;
export declare const clearMessages: {
  (
    ids: string[]
  ): import('@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils').Action<
    'user-dataset-upload/clear-messages',
    {
      ids: string[];
    }
  >;
  readonly type: 'user-dataset-upload/clear-messages';
} & import('@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils').ActionTypeGuardContainer<
  import('@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils').Action<
    'user-dataset-upload/clear-messages',
    {
      ids: string[];
    }
  >
>;
export declare const requestUploadMessages: {
  (): import('@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils').Action<
    'user-dataset-upload/load-upload-messages',
    void
  >;
  readonly type: 'user-dataset-upload/load-upload-messages';
} & import('@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils').ActionTypeGuardContainer<
  import('@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils').Action<
    'user-dataset-upload/load-upload-messages',
    void
  >
>;
export declare const receiveUploadMessages: {
  (
    uploads: UserDatasetUpload[]
  ): import('@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils').Action<
    'user-dataset-upload/receive-upload-messages',
    {
      uploads: UserDatasetUpload[];
    }
  >;
  readonly type: 'user-dataset-upload/receive-upload-messages';
} & import('@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils').ActionTypeGuardContainer<
  import('@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils').Action<
    'user-dataset-upload/receive-upload-messages',
    {
      uploads: UserDatasetUpload[];
    }
  >
>;
export declare const receiveBadUploadHistoryAction: {
  (
    message: string
  ): import('@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils').Action<
    'user-dataset-upload/receive-bad-upload-history-action',
    {
      message: string;
      timestamp: number;
    }
  >;
  readonly type: 'user-dataset-upload/receive-bad-upload-history-action';
} & import('@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils').ActionTypeGuardContainer<
  import('@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils').Action<
    'user-dataset-upload/receive-bad-upload-history-action',
    {
      message: string;
      timestamp: number;
    }
  >
>;
export type Action =
  | InferAction<typeof submitUploadForm>
  | InferAction<typeof receiveBadUpload>
  | InferAction<typeof clearBadUpload>
  | InferAction<typeof cancelCurrentUpload>
  | InferAction<typeof clearMessages>
  | InferAction<typeof requestUploadMessages>
  | InferAction<typeof receiveUploadMessages>
  | InferAction<typeof receiveBadUploadHistoryAction>;
//# sourceMappingURL=UserDatasetUploadActions.d.ts.map
