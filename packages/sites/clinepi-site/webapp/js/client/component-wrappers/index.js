import { get } from 'lodash';
import { IconAlt } from 'wdk-client/Components';
import { withStore } from 'ebrc-client/util/component';

import Index from '../components/Index';
import TableAsTree from '../components/TableAsTree';
import RelativeVisitsGroup from '../components/RelativeVisitsGroup';
import RelatedCaseControlGroup from '../components/RelatedCaseControlGroup';

import Header from 'Client/App/Header';

import * as Category from 'wdk-client/CategoryUtils';
import { CategoriesCheckboxTree } from 'wdk-client/Components';

const injectState = withStore(state => ({
  webAppUrl: get(state, 'globalData.siteConfig.webAppUrl')
}));

export default {
  IndexController: WdkIndexController => class IndexController extends WdkIndexController {
    getStateFromStore () {
      const { displayName, webAppUrl } = get(this.store.getState(), 'globalData.siteConfig');
      return { displayName, webAppUrl };
    }

    getTitle () {
      return this.state.displayName;
    }
    renderView () {
      return (
        <Index {...this.state} />
      )
    }
  },

  SiteHeader: SiteHeader => props => {
    console.log('gettin props on siteheader', props);
    const { siteConfig, preferences, user, ...actions } = props;
    const newProps = { siteConfig, preferences, user, actions };
    return (
      <Header {...newProps} />
    );
  },

  RecordTable: RecordTable => props => {
    return 'tableIsTree' in props.table.properties
      ? <TableAsTree {...props}/>
      : <RecordTable {...props}/>;
  },

  QuestionWizard: QuestionWizard => injectState(props => {
    let { webAppUrl } = props;
    return (
      <div>
        <div className="clinepi-StudyLink">
          <IconAlt fa="info-circle"/>&nbsp;
          Learn about the *FIXME* Study
        </div>
        <QuestionWizard {...props} />
      </div>
    )
  }),

  ActiveGroup: ActiveGroup => props => {
    // Attempt to get the relative observations layout settings and determine
    // if the active group should use the layout. If not, use the default layout.
    return RelativeVisitsGroup.shouldUseLayout(props)
      ? <RelativeVisitsGroup {...props} DefaultComponent={ActiveGroup}/>
      : RelatedCaseControlGroup.shouldUseLayout(props)
        ? <RelatedCaseControlGroup {...props} DefaultComponent={ActiveGroup}/>
        : <ActiveGroup {...props}/>
  },

  QuestionWizardController: QuestionWizardController => class ClinEpiQuestionWizard extends QuestionWizardController {
    constructor(props) {
      super(props);
      Object.assign(this.state, {
        useRangeForNumRelativeEvents: false
      });
    }

    getEventHandlers() {
      return Object.assign(super.getEventHandlers(), {
        setUseRangeForNumRelativeEvents: this.setUseRangeForNumRelativeEvents
      });
    }

    setUseRangeForNumRelativeEvents(useRangeForNumRelativeEvents) {
      this.setState({ useRangeForNumRelativeEvents });
    }

    setParamValue(param, paramValue) {
      super.setParamValue(param, paramValue);
      RelatedCaseControlGroup.handleParamChange(this, param, paramValue);
    }
  }

}
