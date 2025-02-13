/// <reference types="react" />
import PageController from '@veupathdb/wdk-client/lib/Core/Controllers/PageController';
import { StateSlice } from '../StoreModules/types';
declare const actionCreators: {
  showLoginForm: {
    (
      destination?: string | undefined
    ): import('@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils').Action<
      'user-session/show-login-form',
      {
        destination: string | undefined;
      }
    >;
    readonly type: 'user-session/show-login-form';
  } & import('@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils').ActionTypeGuardContainer<
    import('@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils').Action<
      'user-session/show-login-form',
      {
        destination: string | undefined;
      }
    >
  >;
  requestUploadMessages: {
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
  cancelCurrentUpload: {
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
  clearMessages: {
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
};
type StateProps = StateSlice['userDatasetUpload'] &
  Pick<StateSlice['globalData'], 'user'>;
type DispatchProps = typeof actionCreators;
type OwnProps = {
  baseUrl: string;
};
type Props = StateProps & {
  actions: DispatchProps;
} & OwnProps;
declare class UserDatasetAllUploadsController extends PageController<Props> {
  loadData(prevProps?: Props): void;
  getActionCreators(): {
    showLoginForm: {
      (
        destination?: string | undefined
      ): import('@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils').Action<
        'user-session/show-login-form',
        {
          destination: string | undefined;
        }
      >;
      readonly type: 'user-session/show-login-form';
    } & import('@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils').ActionTypeGuardContainer<
      import('@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils').Action<
        'user-session/show-login-form',
        {
          destination: string | undefined;
        }
      >
    >;
    requestUploadMessages: {
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
    cancelCurrentUpload: {
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
    clearMessages: {
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
  };
  isRenderDataLoaded(): boolean;
  getTitle(): string;
  renderView(): JSX.Element;
}
declare const _default: import('react-redux').ConnectedComponent<
  typeof UserDatasetAllUploadsController,
  import('react-redux').Omit<
    import('react').ClassAttributes<UserDatasetAllUploadsController> &
      import('../StoreModules/UserDatasetUploadStoreModule').State &
      Pick<
        Partial<{
          config: import('@veupathdb/wdk-client/lib/Service/ServiceBase').ServiceConfig;
          ontology: import('@veupathdb/wdk-client/lib/Utils/CategoryUtils').CategoryOntology;
          questions: import('@veupathdb/wdk-client/lib/Utils/WdkModel').Question[];
          recordClasses: import('@veupathdb/wdk-client/lib/Utils/WdkModel').RecordClass[];
          user: import('@veupathdb/wdk-client/lib/Utils/WdkUser').User;
          preferences: import('@veupathdb/wdk-client/lib/Utils/WdkUser').UserPreferences;
          siteConfig?: any;
          location: import('history').Location<unknown>;
          loginForm: {
            isOpen: boolean;
            message?: string | undefined;
            destination?: string | undefined;
          };
        }>,
        'user'
      > & {
        actions: {
          showLoginForm: {
            (
              destination?: string | undefined
            ): import('@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils').Action<
              'user-session/show-login-form',
              {
                destination: string | undefined;
              }
            >;
            readonly type: 'user-session/show-login-form';
          } & import('@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils').ActionTypeGuardContainer<
            import('@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils').Action<
              'user-session/show-login-form',
              {
                destination: string | undefined;
              }
            >
          >;
          requestUploadMessages: {
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
          cancelCurrentUpload: {
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
          clearMessages: {
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
        };
      } & OwnProps,
    | 'badUploadMessage'
    | 'baseUrl'
    | 'user'
    | 'uploads'
    | 'badAllUploadsActionMessage'
    | 'actions'
  > &
    OwnProps
>;
export default _default;
//# sourceMappingURL=UserDatasetAllUploadsController.d.ts.map
