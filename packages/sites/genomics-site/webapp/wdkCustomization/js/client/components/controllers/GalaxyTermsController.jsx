import { get } from 'lodash';
import { cloneElement } from 'react';
import { WdkViewController } from 'wdk-client/Controllers';
import { UserActionCreators } from 'wdk-client/ActionCreators';
import { updateSecurityAgreementStatus } from '../../actioncreators/GalaxyTermsActionCreators';

let { updateUserPreference, showLoginForm } = UserActionCreators;

export const SHOW_GALAXY_PAGE_PREFERENCE = 'show-galaxy-orientation-page';

export default class GalaxyTermsController extends WdkViewController {

  constructor(...args) {
    super(...args);
    this.onGalaxyNavigate = this.onGalaxyNavigate.bind(this);
  }

  getStoreName() {
    return "GalaxyTermsStore";
  }

  getActionCreators() {
    return {
      showLoginForm,
      updateUserPreference,
      updateSecurityAgreementStatus
    };
  }

  getStateFromStore(store) {
    return {
      user: get(store.getState(), 'globalData.user'),
      securityAgreementStatus: get(store.getState(), 'securityAgreementStatus', false)
    };
  }

  isRenderDataLoaded(state) {
    return state.user != null;
  }

  getTitle() {
    return "Galaxy Terms";
  }

  onGalaxyNavigate() {
    this.eventHandlers.updateUserPreference(SHOW_GALAXY_PAGE_PREFERENCE, 'false');
    window.open('https://eupathdb.globusgenomics.org', '_blank');
  }

  renderView(state, eventHandlers) {
    // this.props.children is defined in routes.jsx as a child route.
    // It is the component assigned to the route that matched the url.
    return cloneElement(this.props.children, Object.assign({},
      state,
      eventHandlers,
      { onGalaxyNavigate: this.onGalaxyNavigate }
    ));
  }

}
