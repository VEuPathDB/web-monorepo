import { get } from 'lodash';
import Index from '../components/Index';

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

  }
}
