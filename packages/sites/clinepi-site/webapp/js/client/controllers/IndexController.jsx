import { connect } from 'react-redux';
import Index from '../components/Index';
import { getStaticSiteData } from '../selectors/siteData';
import { attemptAction } from 'Client/App/DataRestriction/DataRestrictionActionCreators';
import homeContent from '../data/homeContent';

export default IndexController => {
  const enhance = connect(
    state => {
      const { globalData, studies, newsSidebar } = state;
      const { siteConfig } = globalData;
      const { displayName, webAppUrl } = siteConfig;
      const siteData = getStaticSiteData(state);

      return { displayName, webAppUrl, siteData, isLoading: studies.loading, hasError: !!studies.error, newsSidebar, homeContent };
    },
    { attemptAction }
  );

  class ClinEpiIndexController extends IndexController {

    getTitle () {
      return this.props.displayName;
    }

    isRenderDataLoadError() {
      return this.props.hasError;
    }

    renderView () {
      return (
        <Index {...this.props} />
      )
    }
  }

  return enhance(ClinEpiIndexController);
}
