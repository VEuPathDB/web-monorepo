import { WdkViewController } from 'wdk-client/Controllers';
import { UserActionCreators } from 'wdk-client/ActionCreators';
import GalaxyTerms from '../GalaxyTerms';

let { updateUserPreference, showLoginForm } = UserActionCreators;

export const SHOW_GALAXY_PAGE_PREFERENCE = 'show-galaxy-orientation-page';

export default class GalaxyTermsController extends WdkViewController {

  constructor(...args) {
    super(...args);
    this.setShowPagePreference = this.setShowPagePreference.bind(this);
    this.goToGalaxy = this.goToGalaxy.bind(this);
  }

  getStoreName() {
    return "GalaxyTermsStore";
  }

  getActionCreators() {
    return {
      showLoginForm,
      updateUserPreference
    };
  }

  getStateFromStore(store) {
    let { globalData: { user, preferences } } = store.getState();
    let showPagePreference;

    // only initialize `showPagePreference` when `preferences` are initialized
    if (preferences != null) {
      showPagePreference = preferences[SHOW_GALAXY_PAGE_PREFERENCE] === 'true';
    }

    return { user, showPagePreference };
  }

  isRenderDataLoaded(state) {
    return (state.showPagePreference != null && state.user != null);
  }

  getTitle() {
    return "Galaxy Terms";
  }

  setShowPagePreference(showPagePreference) {
    this.setState({ showPagePreference });
  }

  goToGalaxy() {
    this.eventHandlers.updateUserPreference(SHOW_GALAXY_PAGE_PREFERENCE,
      this.state.showPagePreference ? 'true' : 'false');
    window.open('https://eupathdb.globusgenomics.org', '_blank');
  }

  renderView(state, eventHandlers) {
    return (
      <GalaxyTerms
        {...state}
        {...eventHandlers}
        setShowPagePreference={this.setShowPagePreference}
        goToGalaxy={this.goToGalaxy}
      />
    );
  }

}
