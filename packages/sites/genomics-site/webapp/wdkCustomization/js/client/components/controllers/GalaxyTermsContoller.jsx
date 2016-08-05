import { WdkViewController } from 'wdk-client/Controllers';
import { UserActionCreators } from 'wdk-client/ActionCreators';
import GalaxyTerms from '../GalaxyTerms';

let updateUserPreference = UserActionCreators.updateUserPreference;

class GalaxyTermsController extends WdkViewController {

  getStoreName() {
    return "GalaxyTermsStore";
  }

  getActionCreators() {
    return { updateUserPreference };
  }

  isRenderDataLoaded(state) {
    return (state.preferences != null);
  }

  getTitle() {
    return "Galaxy Terms";
  }

  renderView(state, eventHandlers) {
    return ( <GalaxyTerms {...state} galaxyTermsActions={eventHandlers}/> );
  }

}

export default GalaxyTermsController;
