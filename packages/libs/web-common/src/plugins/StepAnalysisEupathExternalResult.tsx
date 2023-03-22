import {
  downloadUrlQueryParamFactory,
  propertiesUrlQueryParamFactory,
  contextHashQueryParamFactory,
  stepAnalysisExternalResultFactory
} from '@veupathdb/wdk-client/lib/Components/StepAnalysis/StepAnalysisExternalResultFactory';
import { StepAnalysisResultPluginProps } from '@veupathdb/wdk-client/lib/Components/StepAnalysis/StepAnalysisResultsPane';

const projectFolderHashQueryParamFactory = ({
  analysisResult: { projectFolder }
}: StepAnalysisResultPluginProps) => encodeURIComponent(projectFolder);

export const StepAnalysisEupathExternalResult = stepAnalysisExternalResultFactory([
  ['contextHash', contextHashQueryParamFactory],
  ['dataUrl', downloadUrlQueryParamFactory],
  ['propertiesUrl', propertiesUrlQueryParamFactory],
  ['projectFolder', projectFolderHashQueryParamFactory]
]);
