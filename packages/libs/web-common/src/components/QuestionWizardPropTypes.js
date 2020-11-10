import PropTypes from 'prop-types';

const wizardPropTypes = {
  question: PropTypes.object.isRequired,
  paramValues: PropTypes.object.isRequired,
  paramUIState: PropTypes.object.isRequired,
  groupUIState: PropTypes.object.isRequired,
  recordClass: PropTypes.object.isRequired,
  activeGroup: PropTypes.object,
  initialCount: PropTypes.number
};

const wizardEventHandlerPropTypes = {
  onGroupSelect: PropTypes.func.isRequired,
  onInvalidGroupCountsUpdate: PropTypes.func.isRequired,
  onFilterPopupVisibilityChange: PropTypes.func.isRequired,
  onFilterPopupPinned: PropTypes.func.isRequired
}

const parameterEventHandlers = {
  onOntologyTermSelect: PropTypes.func.isRequired,
  onOntologyTermSummaryUpdate: PropTypes.func.isRequired,
  onOntologyTermSort: PropTypes.func.isRequired,
  onOntologyTermSearch: PropTypes.func.isRequired,
  onParamValueChange: PropTypes.func.isRequired,
  onParamStateChange: PropTypes.func.isRequired
}

export default {
  customName: PropTypes.string,
  isAddingStep: PropTypes.bool.isRequired,
  showHelpText: PropTypes.bool.isRequired,
  wizardState: PropTypes.shape(wizardPropTypes).isRequired,
  wizardEventHandlers: PropTypes.shape(wizardEventHandlerPropTypes),
  parameterEventHandlers: PropTypes.shape(parameterEventHandlers),
  additionalHeadingContent: PropTypes.node
};
