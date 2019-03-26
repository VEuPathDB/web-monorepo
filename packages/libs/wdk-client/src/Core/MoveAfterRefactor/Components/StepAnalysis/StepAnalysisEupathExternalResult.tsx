import {
  downloadUrlQueryParamFactory,
  propertiesUrlQueryParamFactory,
  contextHashQueryParamFactory,
  stepAnalysisExternalResultFactory
} from './StepAnalysisExternalResultFactory';
import { StepAnalysisResultPluginProps } from './StepAnalysisResultsPane';

const projectFolderHashQueryParamFactory = ({
  analysisResult: { projectFolder }
}: StepAnalysisResultPluginProps) => encodeURIComponent(projectFolder);

export const StepAnalysisEupathExternalResult = stepAnalysisExternalResultFactory([
  ['contextHash', contextHashQueryParamFactory],
  ['dataUrl', downloadUrlQueryParamFactory],
  ['propertiesUrl', propertiesUrlQueryParamFactory],
  ['projectFolder', projectFolderHashQueryParamFactory]
]);
