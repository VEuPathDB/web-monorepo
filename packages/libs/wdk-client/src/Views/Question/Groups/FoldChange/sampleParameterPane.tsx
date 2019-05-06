import React, { ReactNode } from 'react';

import { ResizableContainer } from 'wdk-client/Components'

type ResizingOptions = JQueryUI.ResizableOptions;

interface SampleParameterPaneProps {
  parameterElement: ReactNode;
  resizingOptions?: ResizingOptions;
}

const sampleParameterPane = (sampleParameterTypeClass: string, tabHeader: string): React.FunctionComponent<SampleParameterPaneProps> => ({
  parameterElement,
  resizingOptions
}) => 
  <div className="wdk-FoldChangeSampleParameterPane">
    in the following <span className={`wdk-FoldChangeSampleParameterTab ${sampleParameterTypeClass}`}>{tabHeader}</span>
    <div className={`wdk-FoldChangeSampleParameterContainer ${sampleParameterTypeClass}`}>
      <ResizableContainer
        alsoResize=".wdk-CheckboxList > div:first-child"
        maxWidth={120}
        minWidth={120}
        handles="all"
      >
        {parameterElement}
      </ResizableContainer>
    </div>
  </div>;

export const ReferenceSampleParameterPane = sampleParameterPane('wdk-FoldChangeReferenceSample', 'Reference Samples');
export const ComparisonSampleParameterPane = sampleParameterPane('wdk-FoldChangeComparisonSample', 'Comparison Samples');
