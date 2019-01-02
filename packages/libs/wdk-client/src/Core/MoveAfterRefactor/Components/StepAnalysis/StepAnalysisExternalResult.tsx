import {
  downloadUrlQueryParamFactory,
  propertiesUrlQueryParamFactory,
  contextHashQueryParamFactory,
  stepAnalysisExternalResultFactory
} from './StepAnalysisExternalResultFactory';

export const StepAnalysisExternalResult = stepAnalysisExternalResultFactory([
  ['contextHash', contextHashQueryParamFactory],
  ['dataUrl', downloadUrlQueryParamFactory],
  ['propertiesUrl', propertiesUrlQueryParamFactory]
]);
