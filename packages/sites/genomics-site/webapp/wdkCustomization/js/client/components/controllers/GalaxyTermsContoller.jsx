import GalaxyTerms from "../GalaxyTerms";
import { WdkViewController, UserActionCreators } from 'wdk-client/Components';

class GalaxyTermsController extends WdkViewController {

  getStoreName() {
    return "UserProfileStore";
  }

  getActionCreators() {
    return UserActionCreators;
  }

  isRenderDataLoaded(state) {
    return (state.user != null);
  }

  getTitle() {
    return "Galaxy Terms";
  }

  renderView(state, eventHandlers) {
    return ( <GalaxyTerms {...state} galaxyTermsActions={eventHandlers}/> );
  }

}

export default GalaxyTermsController;
