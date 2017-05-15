import { get } from 'lodash';
import { displayName } from 'eupathdb/wdkCustomization/js/client/config';
import Index from '../components/Index';
import Index2 from '../components/Index2';

export default {
  IndexController: WdkIndexController => class IndexController extends WdkIndexController {

    getTitle() {
      return displayName;
    }

    renderView(state) {
      const C = 'alt' in this.props.location.query ? Index2 : Index;
      return (
        <C displayName={displayName} />
      )
    }

  }
}
