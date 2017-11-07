import { get } from 'lodash';
import { AbstractPageController } from 'wdk-client/Controllers';
import { UserActionCreators } from 'wdk-client/ActionCreators';
import GalaxyTermsStore from '../../stores/GalaxyTermsStore';
import { updateSecurityAgreementStatus } from '../../actioncreators/GalaxyTermsActionCreators';
import GalaxyTerms from '../GalaxyTerms';
import GalaxySignUp from '../GalaxySignUp';

let { updateUserPreference, showLoginForm } = UserActionCreators;

export const SHOW_GALAXY_PAGE_PREFERENCE = 'show-galaxy-orientation-page';

export default class GalaxyTermsController extends AbstractPageController {

  constructor(...args) {
    super(...args);
    this.onGalaxyNavigate = this.onGalaxyNavigate.bind(this);
  }

  getStoreClass() {
    return GalaxyTermsStore;
  }

  getActionCreators() {
    return {
      showLoginForm,
      updateUserPreference,
      updateSecurityAgreementStatus
    };
  }

  getStateFromStore() {
    return {
      user: get(this.store.getState(), 'globalData.user'),
      securityAgreementStatus: get(this.store.getState(), 'securityAgreementStatus', false),
      webAppUrl: get(this.store.getState(), 'globalData.config.webAppUrl')
    };
  }

  isRenderDataLoaded() {
    return this.state.user != null;
  }

  getTitle() {
    return "Galaxy Terms";
  }

  onGalaxyNavigate() {
    this.eventHandlers.updateUserPreference("global", SHOW_GALAXY_PAGE_PREFERENCE, 'false');
    window.open('https://eupathdb.globusgenomics.org', '_blank');
  }

  renderView() {
    const ViewComponent = this.props.location.pathname.includes('/sign-up')
      ? GalaxySignUp
      : GalaxyTerms;
    return (
      <ViewComponent
        {...this.state}
        {...this.eventHandlers}
        onGalaxyNavigate={this.onGalaxyNavigate}
      />
    );
  }

}
