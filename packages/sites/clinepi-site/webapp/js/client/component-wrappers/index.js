import { get } from 'lodash';
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
      return { displayName, webAppUrl };
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

  ActiveGroup: ActiveGroup => props => {

    // Attempt to get the relative observations layout settings and determine
    // if the active group should use the layout. If not, use the default layout.

    if (!(layoutProperyKey in props.question.properties)) {
      return <ActiveGroup {...props}/>
    }

    try {
      const relatedObservationsLayoutSettings = JSON.parse(props.question.properties[layoutProperyKey]);

      const missingKeys = requiredLayoutSettingKeys.filter(key =>
        !(key in relatedObservationsLayoutSettings));

      if (missingKeys.length > 0) {
        throw new Error("The following keys are missing from the " +
          layoutProperyKey + " object: " + missingKeys.join(', '));
      }

      if (relatedObservationsLayoutSettings[relatedObservationsGroupNameKey] !== props.activeGroup.name) {
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
        onUseRangeForNumRelativeEventsChange: this.onUseRangeForNumRelativeEventsChange
      });
    }

    onUseRangeForNumRelativeEventsChange(useRangeForNumRelativeEvents) {
      this.setState({ useRangeForNumRelativeEvents });
    }
  }

}
