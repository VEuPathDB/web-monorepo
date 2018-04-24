import { get } from 'lodash';
import { IconAlt } from 'wdk-client/Components';
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

const injectState = withStore(state => ({
  webAppUrl: get(state, 'globalData.siteConfig.webAppUrl'),
  studies: get(state, 'globalData.siteConfig.studies')
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

    isRenderDataLoaded() {
      return this.state.isLoading === false;
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

  DownloadForm: DownloadForm => props => {
    const { name } = props.recordClass;
    const studyId = getIdFromRecordClassName(name);
    emitRestriction('downloadPage', { studyId });
    return <DownloadForm {...props} />
  },

  SiteHeader: () => rawProps => {
    const { siteConfig, studies, preferences, user = {}, ...actions } = rawProps;
    const siteData = getStaticSiteData(studies.entities);
    const props = { siteConfig, preferences, user, actions, siteData };
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

  QuestionWizard: QuestionWizard => injectState(props => {
    let { studies, webAppUrl, wizardState } = props;
    let activeStudy = findStudyFromRecordClass(studies, wizardState.recordClass);
    return (
      <div>
        { activeStudy == null
            ? "Could not find study based on the record class. Make sure the study id in studies.json is correct."
            : (
              <div className="clinepi-StudyLink">
                <IconAlt fa="info-circle"/>&nbsp;
                Learn about the <a href={`${webAppUrl}/app/record/dataset/${activeStudy.id}`} target="_blank">{activeStudy.name} Study</a>
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

/**
 * Parse the study id from the recordClass's urlSegment property.
 * Currently, the urlSegment is of the form `${studyId}_${recordTypeShortName}`,
 * where studyId is of the form `DS_${hash}`.
 *
 * FIXME Replace this something more robust. See trello #883.
 */
function findStudyFromRecordClass(studies, recordClass) {
  try {
    let [ studyId ] = recordClass.urlSegment.match(/^DS_[^_]+/g);
    return studies.find(study => study.id === studyId);
  }
  catch (error) {
    console.error("Could not find study from record class.", { recordClass });
    throw error;
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
