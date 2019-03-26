import { get } from 'lodash';
import { connect } from 'react-redux';
import { PageController } from 'wdk-client/Controllers';
import { UserActions } from 'wdk-client/Actions';
import { updateSecurityAgreementStatus } from '../../actioncreators/GalaxyTermsActionCreators';
import GalaxyTerms from '../GalaxyTerms';
import GalaxySignUp from '../GalaxySignUp';

let { updateUserPreference, showLoginForm } = UserActions;

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
    window.open('https://eupathdb.globusgenomics.org', '_blank');
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
