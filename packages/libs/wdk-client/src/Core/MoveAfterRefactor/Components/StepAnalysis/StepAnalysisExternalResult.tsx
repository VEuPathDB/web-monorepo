import React, { CSSProperties } from 'react';
import { StepAnalysisResultPluginProps } from './StepAnalysisResultsPane';

const divStyle: CSSProperties = { textAlign: 'center' };
const iframeStyle: CSSProperties = { border: 0 };

export const StepAnalysisExternalResult: React.SFC<StepAnalysisResultPluginProps> = ({
  analysisResult: { iframeUrl, iframeWidth, iframeHeight }
}) =>
  <div style={divStyle}>
    <iframe style={iframeStyle} src={`${iframeUrl}`} width={iframeWidth} height={iframeHeight}/>
  </div>
