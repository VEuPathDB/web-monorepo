import { get } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import { PageController } from '@veupathdb/wdk-client/lib/Controllers';
import { UserActions, UserSessionActions } from '@veupathdb/wdk-client/lib/Actions';
import { updateSecurityAgreementStatus } from 'ebrc-client/actioncreators/GalaxyTermsActionCreators';
import GalaxyTerms from 'ebrc-client/components/GalaxyTerms';
import GalaxySignUp from 'ebrc-client/components/GalaxySignUp';

let { updateUserPreference } = UserActions;
let { showLoginForm } = UserSessionActions;

export const SHOW_GALAXY_PAGE_PREFERENCE = 'show-galaxy-orientation-page';

class GalaxyTermsController extends PageController {

  constructor(...args) {
    super(...args);
    this.onGalaxyNavigate = this.onGalaxyNavigate.bind(this);
  }

  isRenderDataLoaded() {
    const { 
      stateProps: { user } 
    } = this.props;

    return user != null;
  }

  getTitle() {
    return "Galaxy Terms";
  }

  onGalaxyNavigate() {
    const { 
      dispatchProps: { updateUserPreference } 
    } = this.props;

    updateUserPreference("global", SHOW_GALAXY_PAGE_PREFERENCE, 'false');
    window.open('https://veupathdb.globusgenomics.org', '_blank');
  }

  renderView() {
    const {
      stateProps,
      dispatchProps,
      signUp
    } = this.props;

    const ViewComponent = signUp
      ? GalaxySignUp
      : GalaxyTerms;
    return (
      <ViewComponent
        {...stateProps}
        {...dispatchProps}
        onGalaxyNavigate={this.onGalaxyNavigate}
      />
    );
  }

}

export default connect(
  state => ({ 
    user: get(state, 'globalData.user'),
    securityAgreementStatus: get(state, 'galaxyTerms.securityAgreementStatus'),
    webAppUrl: get(state, 'globalData.siteConfig.webAppUrl')
  }),
  {
    showLoginForm,
    updateUserPreference,
    updateSecurityAgreementStatus
  },
  (stateProps, dispatchProps, { signUp }) => ({
    stateProps,
    dispatchProps,
    signUp
  })
)(GalaxyTermsController);
