import PropTypes from 'prop-types';

const paramEventHandlerPropTypes = {
  onOntologyTermSelectCurrentFilters: PropTypes.func.isRequired,
  onOntologyTermSummaryUpdate: PropTypes.func.isRequired,
  onOntologyTermSort: PropTypes.func.isRequired,
  onOntologyTermSearch: PropTypes.func.isRequired,
  onParamValueChange: PropTypes.func.isRequired,
  onParamStateChange: PropTypes.func.isRequired,
};

export const paramGroupPropTypes = {
  eventHandlers: PropTypes.shape(paramEventHandlerPropTypes),
  group: PropTypes.object.isRequired,
  parameters: PropTypes.array.isRequired,
  paramValues: PropTypes.object.isRequired,
  paramUIState: PropTypes.object.isRequired,
};

export const paramPropTypes = {
  ...paramEventHandlerPropTypes,
  param: PropTypes.object.isRequired,
  value: PropTypes.string.isRequired,
  uiState: PropTypes.object.isRequired,
};
