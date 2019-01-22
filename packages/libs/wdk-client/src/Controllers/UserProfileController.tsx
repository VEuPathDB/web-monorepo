import * as React from 'react';
import { connect } from 'react-redux';
import { submitProfileForm, profileFormUpdate } from 'wdk-client/Actions/UserActions';
import PageController from 'wdk-client/Core/Controllers/PageController';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import UserProfile from 'wdk-client/Views/User/Profile/UserProfile';
import { RootState } from 'wdk-client/Core/State/Types';

const actionCreators = {
  updateProfileForm: profileFormUpdate,
  submitProfileForm
};

type StateProps =
  & Pick<RootState, 'globalData'>
  & RootState['userProfile'];

type DispatchProps = { userEvents: typeof actionCreators; };

type Props = DispatchProps & StateProps;

class UserProfileController extends PageController<Props> {

  isRenderDataLoaded() {
    return ( this.props.globalData.user != null &&
            this.props.globalData.preferences != null &&
            this.props.globalData.config != null);
  }

  getTitle() {
    return "User Account";
  }

  renderView() {
    return ( <UserProfile {...this.props} /> );
  }
}

const enhance = connect<StateProps, typeof actionCreators, {}, Props, RootState>(
  (state: RootState) => ({
    globalData: state.globalData,
    ...state.userProfile,
    userFormData: {
      ...state.globalData.user,
      confirmEmail: state.globalData.user && state.globalData.user.email,
      preferences: state.globalData.preferences,
      ...state.userProfile.userFormData
    }
  }),
  actionCreators,
  (stateProps, dispatchProps) => ({ ...stateProps, userEvents: dispatchProps })
)

export default enhance(wrappable(UserProfileController));
