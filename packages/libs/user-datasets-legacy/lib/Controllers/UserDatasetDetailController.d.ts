import { ComponentType } from 'react';
import PageController from '@veupathdb/wdk-client/lib/Core/Controllers/PageController';
import { Question } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import {
  loadUserDatasetDetail,
  removeUserDataset,
  shareUserDatasets,
  unshareUserDatasets,
  updateUserDatasetDetail,
} from '../Actions/UserDatasetsActions';
import UserDatasetDetail from '../Components/Detail/UserDatasetDetail';
import { StateSlice } from '../StoreModules/types';
import { DataNoun } from '../Utils/types';
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
  loadUserDatasetDetail: typeof loadUserDatasetDetail;
  updateUserDatasetDetail: typeof updateUserDatasetDetail;
  removeUserDataset: typeof removeUserDataset;
  shareUserDatasets: typeof shareUserDatasets;
  unshareUserDatasets: typeof unshareUserDatasets;
};
export type UserDatasetDetailProps = any;
type StateProps = StateSlice['userDatasetDetail'] & StateSlice['globalData'];
type DispatchProps = typeof ActionCreators;
type OwnProps = {
  baseUrl: string;
  detailsPageTitle: string;
  workspaceTitle: string;
  id: string;
  detailComponentsByTypeName?: Record<
    string,
    ComponentType<UserDatasetDetailProps>
  >;
  dataNoun: DataNoun;
};
type MergedProps = {
  ownProps: OwnProps;
  dispatchProps: DispatchProps;
  stateProps: StateProps;
};
/**
 * View Controller for a userDataset record.
 *
 * Note that we are accessing the userDataset from an object keyed by the
 * userDataset's id. This avoids race conditions that arise when ajax requests
 * complete in a different order than they were invoked.
 */
declare class UserDatasetDetailController extends PageController<MergedProps> {
  getQuestionUrl: (question: Question) => string;
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
    loadUserDatasetDetail: typeof loadUserDatasetDetail;
    updateUserDatasetDetail: typeof updateUserDatasetDetail;
    removeUserDataset: typeof removeUserDataset;
    shareUserDatasets: typeof shareUserDatasets;
    unshareUserDatasets: typeof unshareUserDatasets;
  };
  loadData(prevProps?: this['props']): void;
  isRenderDataLoadError(): boolean;
  isRenderDataLoaded(): boolean;
  getDetailView(type: any): ComponentType<any> | typeof UserDatasetDetail;
  renderGuestView(): JSX.Element;
  renderView(): JSX.Element;
}
declare const _default: import('react-redux').ConnectedComponent<
  typeof UserDatasetDetailController,
  import('react-redux').Omit<
    import('react').ClassAttributes<UserDatasetDetailController> & MergedProps,
    'ownProps' | 'dispatchProps' | 'stateProps'
  > &
    OwnProps
>;
export default _default;
//# sourceMappingURL=UserDatasetDetailController.d.ts.map
