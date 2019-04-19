import React from 'react';
import { StepAnalysisResultPluginProps } from './StepAnalysisResultsPane';

interface QueryParamFactory {
  (props: StepAnalysisResultPluginProps): string;
}

const generateIframeUrl = (queryParamFactories: [string, QueryParamFactory][], props: StepAnalysisResultPluginProps) => {
  const queryParams = queryParamFactories.map(([key, factory]) => `${key}=${encodeURIComponent(factory(props))}`);
  const queryString = queryParams.join('&');

  return `${props.analysisResult.iframeBaseUrl}?${queryString}`;
}

export const downloadUrlQueryParamFactory = ({ 
  analysisConfig: { analysisId, stepId },
  analysisResult: { downloadUrlBase, downloadPath }
}: StepAnalysisResultPluginProps) =>
  `${downloadUrlBase}/users/current/steps/${stepId}/analyses/${analysisId}/resources?path=${downloadPath}`;

export const propertiesUrlQueryParamFactory = ({
  analysisConfig: { analysisId, stepId },
  analysisResult: { accessToken, propertiesUrlBase }
}: StepAnalysisResultPluginProps) =>
  `${propertiesUrlBase}/users/current/steps/${stepId}/analyses/${analysisId}/properties?accessToken=${accessToken}`;

export const contextHashQueryParamFactory = ({
  analysisResult: { contextHash }
}: StepAnalysisResultPluginProps) => encodeURIComponent(contextHash);

export const stepAnalysisExternalResultFactory = (queryParamFactories: [string, QueryParamFactory][]): React.SFC<StepAnalysisResultPluginProps> => (props) =>
  <div className="external-result-container">
    <iframe 
      style={{
        width: props.analysisResult.iframeWidth,
        height: props.analysisResult.iframeHeight
      }} 
      src={generateIframeUrl(queryParamFactories, props)}
    />
  </div>
