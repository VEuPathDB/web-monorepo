import { WdkViewController } from 'wdk-client/Controllers';
import { UserActionCreators } from 'wdk-client/ActionCreators';
import GalaxyTerms from '../GalaxyTerms';

let updateUserPreference = UserActionCreators.updateUserPreference;
let showLoginWarning = UserActionCreators.showLoginWarning

class GalaxyTermsController extends WdkViewController {

  getStoreName() {
    return "GalaxyTermsStore";
  }

  getActionCreators() {
    return { updateUserPreference, showLoginWarning };
  }

  isRenderDataLoaded(state) {
    return (state.preferences != null && state.user != null);
  }

  getTitle() {
    return "Galaxy Terms";
  }

  renderView(state, eventHandlers) {
    return ( <GalaxyTerms {...state} galaxyTermsActions={eventHandlers}/> );
  }

}

export default GalaxyTermsController;
