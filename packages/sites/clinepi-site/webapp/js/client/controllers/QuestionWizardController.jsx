import RelatedCaseControlGroup from '../components/RelatedCaseControlGroup';

export default QuestionWizardController => class ClinEpiQuestionWizard extends QuestionWizardController {
  constructor(props) {
    super(props);
    Object.assign(this.state, {
      useRangeForNumRelativeEvents: false
    });
  }

  getWizardEventHandlers() {
    return Object.assign(super.getWizardEventHandlers(), {
      onUseRangeForNumRelativeEventsChange: this.onUseRangeForNumRelativeEventsChange
    });
  }

  onUseRangeForNumRelativeEventsChange(useRangeForNumRelativeEvents) {
    this.setState({ useRangeForNumRelativeEvents });
  }

  setParamValue(param, paramValue) {
    super.setParamValue(param, paramValue);
    RelatedCaseControlGroup.handleParamChange(this, param, paramValue);
  }
}
