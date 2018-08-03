import { get } from 'lodash';
import { IconAlt, Link } from 'wdk-client/Components';
import { withStore } from 'ebrc-client/util/component';

import Index from '../components/Index';
import TableAsTree from '../components/TableAsTree';
import RelativeVisitsGroup from '../components/RelativeVisitsGroup';
import RelatedCaseControlGroup from '../components/RelatedCaseControlGroup';

import Header from 'Client/App/Header';
import { DataRestrictionDaemon } from 'Client/App/DataRestriction';
import { getIdFromRecordClassName, emitRestriction } from 'Client/App/DataRestriction/DataRestrictionUtils';

import searches from 'Client/data/searches.json';
import visualizations from 'Client/data/visualizations.json';

const injectSearchStudy = withStore((state, props) => ({
  activeStudy: get(state, 'globalData.studies.entities', [])
    .find(study =>
      Object.values(study.searches).includes(props.wizardState.question.name))
}));

export function getStaticSiteData (studies) {
  return { studies, searches, visualizations };
}

export default {
  IndexController: WdkIndexController => class IndexController extends WdkIndexController {
    getStateFromStore () {
      const { globalData } = this.store.getState();
      const { siteConfig, studies } = globalData;
      const { displayName, webAppUrl } = siteConfig;
      const siteData = getStaticSiteData(studies.entities);

      return { displayName, webAppUrl, siteData, isLoading: studies.loading };
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
/*
  DownloadForm: DownloadForm => props => {
    const { name } = props.recordClass;
    const studyId = getIdFromRecordClassName(name);
    emitRestriction('downloadPage', { studyId });
    return <DownloadForm {...props} />
  },
*/
  SiteHeader: () => rawProps => {
    const {  user = {}, siteConfig, studies, preferences, ...actions } = rawProps;
    const siteData = getStaticSiteData(studies.entities);
    const props = { user, siteConfig, preferences, actions, siteData };
    return (
      <div>
        <Header {...props} />
        <DataRestrictionDaemon {...props} />
      </div>
    );
  },

  RecordTable: RecordTable => props => {
    return 'tableIsTree' in props.table.properties
      ? <TableAsTree {...props}/>
      : <RecordTable {...props}/>;
  },

  QuestionWizard: QuestionWizard => injectSearchStudy(props => {
    let { activeStudy } = props;
    return (
      <div>
        { activeStudy == null
            ? "Could not find study based on the record class. Make sure the study id in studies.json is correct."
            : (
              <div className="clinepi-StudyLink">
                <IconAlt fa="info-circle"/>&nbsp;
                Learn about the <Link to={activeStudy.route} _target="blank" >{activeStudy.name} Study</Link>
              </div>
            )
        }
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

  FilterSummaryGroup: guard(RelativeVisitsGroup.showFilterSummary),

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

function guard(propsPredicate) {
  return function makeGuardedComponent(Component) {
    return function GuardedComponent(props) {
      return propsPredicate(props)
        ? <Component {...props} />
        : null;
    }
  }
}
