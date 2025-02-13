/// <reference types="react" />
import { RouteComponentProps } from 'react-router-dom';
import PageController from '@veupathdb/wdk-client/lib/Core/Controllers/PageController';
import {
  loadUserDatasetList,
  removeUserDataset,
  shareUserDatasets,
  unshareUserDatasets,
  updateProjectFilter,
  updateUserDatasetDetail,
} from '../Actions/UserDatasetsActions';
import { StateSlice } from '../StoreModules/types';
import { DataNoun } from '../Utils/types';
import '../Components/UserDatasets.scss';
declare const ActionCreators: {
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
  loadUserDatasetList: typeof loadUserDatasetList;
  updateUserDatasetDetail: typeof updateUserDatasetDetail;
  removeUserDataset: typeof removeUserDataset;
  shareUserDatasets: typeof shareUserDatasets;
  unshareUserDatasets: typeof unshareUserDatasets;
  updateProjectFilter: typeof updateProjectFilter;
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
};
type StateProps = Pick<
  StateSlice,
  'userDatasetList' | 'userDatasetUpload' | 'globalData'
>;
type DispatchProps = typeof ActionCreators;
interface OwnProps extends RouteComponentProps<{}> {
  baseUrl: string;
  hasDirectUpload: boolean;
  helpRoute: string;
  workspaceTitle: string;
  dataNoun: DataNoun;
}
type Props = {
  ownProps: OwnProps;
  dispatchProps: DispatchProps;
  stateProps: StateProps;
};
declare class UserDatasetListController extends PageController<Props> {
  constructor(props: Props);
  getTitle(): string;
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
    loadUserDatasetList: typeof loadUserDatasetList;
    updateUserDatasetDetail: typeof updateUserDatasetDetail;
    removeUserDataset: typeof removeUserDataset;
    shareUserDatasets: typeof shareUserDatasets;
    unshareUserDatasets: typeof unshareUserDatasets;
    updateProjectFilter: typeof updateProjectFilter;
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
  };
  needsUploadMessages(): boolean;
  loadData(prevProps?: Props): void;
  isRenderDataLoaded(): boolean;
  isRenderDataLoadError(): boolean;
  renderView(): JSX.Element | null;
}
declare const _default: import('react').ComponentClass<
  Pick<
    import('react-redux').Omit<
      import('react').ClassAttributes<UserDatasetListController> & Props,
      'ownProps' | 'dispatchProps' | 'stateProps'
    > &
      OwnProps,
    | 'baseUrl'
    | 'hasDirectUpload'
    | 'helpRoute'
    | 'workspaceTitle'
    | 'dataNoun'
    | keyof import('react').ClassAttributes<UserDatasetListController>
  >,
  any
> &
  import('react-router').WithRouterStatics<
    import('react-redux').ConnectedComponent<
      typeof UserDatasetListController,
      import('react-redux').Omit<
        import('react').ClassAttributes<UserDatasetListController> & Props,
        'ownProps' | 'dispatchProps' | 'stateProps'
      > &
        OwnProps
    >
  >;
export default _default;
//# sourceMappingURL=UserDatasetListController.d.ts.map
