import { get } from 'lodash';
import { IconAlt } from 'wdk-client/Components';
import { withStore } from 'ebrc-client/util/component';
import Index from '../components/Index';
import ClinEpiActiveGroup, {
  observationsGroupNameKey,
  relatedObservationsGroupNameKey,
  useRelativeObservationsParamNameKey,
  dateOperatorParamNameKey,
  daysBetweenParamNameKey,
  dateDirectionParamNameKey,
  numRelativeEventsParamNameKey,
  relativeVisitsParamNameKey
} from '../components/ActiveGroup';

const injectState = withStore(state => ({
  studies: get(state, 'globalData.siteConfig.studies'),
  webAppUrl: get(state, 'globalData.siteConfig.webAppUrl')
}));

const layoutProperyKey = 'relatedObservationsLayoutSettings';
const requiredLayoutSettingKeys = [
  observationsGroupNameKey,
  relatedObservationsGroupNameKey,
  useRelativeObservationsParamNameKey,
  dateOperatorParamNameKey,
  daysBetweenParamNameKey,
  dateDirectionParamNameKey,
  numRelativeEventsParamNameKey,
  relativeVisitsParamNameKey
];

export default {
  IndexController: WdkIndexController => class IndexController extends WdkIndexController {

    getStateFromStore() {
      const displayName = get(this.store.getState(), 'globalData.siteConfig.displayName');
      const webAppUrl = get(this.store.getState(), 'globalData.siteConfig.webAppUrl');
      const studies = get(this.store.getState(), 'globalData.siteConfig.studies');
      return { displayName, webAppUrl, studies };
    }

    getTitle() {
      return this.state.displayName;
    }

    renderView() {
      return (
        <Index {...this.state} />
      )
    }

  },

  QuestionWizard: QuestionWizard => injectState(props => {
    let { studies, webAppUrl } = props;
    let activeStudy = studies.find(s => s.active);
    return (
      <div>
        <div className="clinepi-StudyLink">
          <IconAlt fa="info-circle"/>&nbsp;
          Learn about the <a href={`${webAppUrl}/app/${activeStudy.route}`} target="_blank">{activeStudy.name} Study</a>
        </div>
        <QuestionWizard {...props} />
      </div>
    )
  }),

  ActiveGroup: ActiveGroup => props => {

    // Attempt to get the relative observations layout settings and determine
    // if the active group should use the layout. If not, use the default layout.

    if (!(layoutProperyKey in props.wizardState.question.properties)) {
      return <ActiveGroup {...props}/>
    }

    try {
      const relatedObservationsLayoutSettings = JSON.parse(props.wizardState.question.properties[layoutProperyKey]);

      const missingKeys = requiredLayoutSettingKeys.filter(key =>
        !(key in relatedObservationsLayoutSettings));

      if (missingKeys.length > 0) {
        throw new Error("The following keys are missing from the " +
          layoutProperyKey + " object: " + missingKeys.join(', '));
      }

      if (relatedObservationsLayoutSettings[relatedObservationsGroupNameKey] !== props.wizardState.activeGroup.name) {
        return (
          <ActiveGroup {...props} />
        );
      }

      return (
        <ClinEpiActiveGroup
          {...props}
          relatedObservationsLayoutSettings={relatedObservationsLayoutSettings}
          DefaultComponent={ActiveGroup}
        />
      );
    }

    catch(error) {
      console.error('Could not use relative observations layout. Using standard layout', error);
      return (
        <ActiveGroup {...props} />
      );
    }
  },

  QuestionWizardController: QuestionWizardController => class extends QuestionWizardController {
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
  }

}
