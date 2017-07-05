import { get } from 'lodash';
import Index from '../components/Index';

export default {
  IndexController: WdkIndexController => class IndexController extends WdkIndexController {

    getStateFromStore(store) {
      return {
        displayName: get(store.getState(), 'globalData.siteConfig.displayName')
      };
    }

    getTitle(state) {
      return state.displayName;
    }

    renderView(state) {
      return (
        <Index displayName={state.displayName} />
      )
    }

  }
}
