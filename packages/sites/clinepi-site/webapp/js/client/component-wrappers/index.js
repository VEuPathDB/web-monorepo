import { get } from 'lodash';
import Index from '../components/Index';
// import ClinEpiActiveGroup from '../components/ActiveGroup';

export default {
  IndexController: WdkIndexController => class IndexController extends WdkIndexController {

    getStateFromStore(store) {
      const displayName = get(store.getState(), 'globalData.siteConfig.displayName');
      const webAppUrl = get(store.getState(), 'globalData.siteConfig.webAppUrl');
      return { displayName, webAppUrl };
    }

    getTitle(state) {
      return state.displayName;
    }

    renderView(state) {
      return (
        <Index {...state} />
      )
    }

  },

  // ActiveGroup: ActiveGroup => props =>
  //   <ClinEpiActiveGroup {...props} DefaultComponent={ActiveGroup}/>

}
