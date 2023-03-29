import * as React from 'react';
import { pick } from 'lodash';
import { wrappable } from '../Utils/ComponentUtils';
import PageController from '../Core/Controllers/PageController';
import UserRegistration from '../Views/User/Profile/UserRegistration';
import {
  profileFormUpdate,
  submitRegistrationForm,
  conditionallyTransition,
} from '../Actions/UserActions';
import { RootState } from '../Core/State/Types';
import { connect } from 'react-redux';
import { GlobalData } from '../StoreModules/GlobalData';

const actionCreators = {
  updateProfileForm: profileFormUpdate,
  submitRegistrationForm,
  conditionallyTransition,
};

type Props = OwnProps & StateProps & DispatchProps;

interface OwnProps {
  initialFormFields?: Record<string, string>;
}

type StateProps = {
  globalData: RootState['globalData'];
} & RootState['userProfile'];

type DispatchProps = {
  userEvents: typeof actionCreators;
};

class UserRegistrationController extends PageController<Props> {
  private _formPrepopulated = false;

  getActionCreators() {
    return actionCreators;
  }

  isRenderDataLoaded() {
    // show Loading if user is guest
    //   (will transition to Profile page in loadData() if non-guest)
    return (
      isRenderGlobalDataLoaded(this.props.globalData) &&
      this.props.globalData.user.isGuest
    );
  }

  getTitle() {
    return 'Register';
  }

  renderView() {
    return <UserRegistration {...this.props} />;
  }

  loadData() {
    this.props.userEvents.conditionallyTransition(
      (user) => !user.isGuest,
      '/user/profile'
    );

    if (
      isRenderGlobalDataLoaded(this.props.globalData) &&
      this.props.globalData.user.isGuest &&
      this.props.initialFormFields != null &&
      !this._formPrepopulated
    ) {
      const { email, ...initialUserProperties } = this.props.initialFormFields;

      const userProfilePropertyNames =
        this.props.globalData.config.userProfileProperties.map(
          ({ name }) => name
        );

      const restrictedInitialUserProperties = pick(
        initialUserProperties,
        userProfilePropertyNames
      );

      this.props.userEvents.updateProfileForm({
        ...this.props.userFormData,
        email: email ?? '',
        confirmEmail: email ?? '',
        properties: {
          ...this.props.userFormData?.properties,
          ...restrictedInitialUserProperties,
        },
      });

      this._formPrepopulated = true;
    }
  }
}

const enhance = connect<
  StateProps,
  typeof actionCreators,
  OwnProps,
  Props,
  RootState
>(
  (state) => ({
    globalData: state.globalData,
    ...state.userRegistration,
  }),
  actionCreators,
  (stateProps, dispatchProps, ownProps) => ({
    ...stateProps,
    userEvents: dispatchProps,
    ...ownProps,
  })
);

export default enhance(wrappable(UserRegistrationController));

type LoadedGlobalData = GlobalData &
  Required<Pick<GlobalData, 'config' | 'preferences' | 'user'>>;

function isRenderGlobalDataLoaded(
  globalData: GlobalData
): globalData is LoadedGlobalData {
  return (
    globalData.preferences != null &&
    globalData.config != null &&
    globalData.user != null
  );
}
