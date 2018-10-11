import { get } from 'lodash';
import { connect } from 'react-redux';
import { PageController } from 'wdk-client/Controllers';
import { UserActionCreators } from 'wdk-client/ActionCreators';
import { updateSecurityAgreementStatus } from '../../actioncreators/GalaxyTermsActionCreators';
import GalaxyTerms from '../GalaxyTerms';
import GalaxySignUp from '../GalaxySignUp';

let { updateUserPreference, showLoginForm } = UserActionCreators;

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
      location
    } = this.props;

    const ViewComponent = location.pathname.includes('/sign-up')
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
  (stateProps, dispatchProps, { location }) => ({
    stateProps,
    dispatchProps,
    location
  })
)(GalaxyTermsController);
