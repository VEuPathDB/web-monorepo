import { get } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import { PageController } from '@veupathdb/wdk-client/lib/Controllers';
import {
  UserActions,
  UserSessionActions,
} from '@veupathdb/wdk-client/lib/Actions';
import { updateSecurityAgreementStatus } from '../actioncreators/GalaxyTermsActionCreators';
import GalaxyTerms from '../components/GalaxyTerms';
import GalaxySignUp from '../components/GalaxySignUp';
import { RootState } from '@veupathdb/wdk-client/lib/Core/State/Types';
import { User } from '@veupathdb/wdk-client/lib/Utils/WdkUser';

const { updateUserPreference } = UserActions;
const { showLoginForm } = UserSessionActions;

export const SHOW_GALAXY_PAGE_PREFERENCE = 'show-galaxy-orientation-page';

interface StateProps {
  user: User | undefined;
  securityAgreementStatus: string | undefined;
  webAppUrl: string | undefined;
}

interface DispatchProps {
  showLoginForm: typeof showLoginForm;
  updateUserPreference: typeof updateUserPreference;
  updateSecurityAgreementStatus: typeof updateSecurityAgreementStatus;
}

interface OwnProps {
  signUp?: boolean;
}

interface GalaxyTermsControllerProps {
  stateProps: StateProps;
  dispatchProps: DispatchProps;
  signUp?: boolean;
}

class GalaxyTermsController extends PageController<GalaxyTermsControllerProps> {
  constructor(props: GalaxyTermsControllerProps) {
    super(props);
    this.onGalaxyNavigate = this.onGalaxyNavigate.bind(this);
  }

  isRenderDataLoaded() {
    const {
      stateProps: { user },
    } = this.props;

    return user != null;
  }

  getTitle() {
    return 'Galaxy Terms';
  }

  onGalaxyNavigate() {
    const {
      dispatchProps: { updateUserPreference },
    } = this.props;

    updateUserPreference('global', SHOW_GALAXY_PAGE_PREFERENCE, 'false');
    window.open('https://veupathdb.globusgenomics.org', '_blank');
  }

  renderView() {
    const { stateProps, dispatchProps, signUp } = this.props;

    const ViewComponent = signUp ? GalaxySignUp : GalaxyTerms;
    return (
      <ViewComponent
        {...stateProps}
        {...dispatchProps}
        onGalaxyNavigate={this.onGalaxyNavigate}
      />
    );
  }
}

export default connect<StateProps, DispatchProps, OwnProps, RootState>(
  (state) => ({
    user: get(state, 'globalData.user'),
    securityAgreementStatus: get(state, 'galaxyTerms.securityAgreementStatus'),
    webAppUrl: get(state, 'globalData.siteConfig.webAppUrl'),
  }),
  {
    showLoginForm,
    updateUserPreference,
    updateSecurityAgreementStatus,
  },
  (stateProps, dispatchProps, { signUp }) => ({
    stateProps,
    dispatchProps,
    signUp,
  })
)(GalaxyTermsController);
