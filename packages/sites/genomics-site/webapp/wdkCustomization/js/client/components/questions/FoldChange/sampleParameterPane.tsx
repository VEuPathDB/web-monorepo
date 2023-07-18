import React, { ReactNode } from 'react';

import {
  ResizableContainer,
  HelpIcon,
} from '@veupathdb/wdk-client/lib/Components';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { Parameter } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

type ResizingOptions = JQueryUI.ResizableOptions;

interface SampleParameterPaneProps {
  parameterElement: ReactNode;
  parameter: Parameter;
}

const sampleParameterPane =
  (
    sampleParameterTypeClass: string,
    tabHeader: string
  ): React.FunctionComponent<SampleParameterPaneProps> =>
  ({ parameterElement, parameter }) =>
    (
      <div className="wdk-FoldChangeSampleParameterPane">
        in the following{' '}
        <span
          className={`wdk-FoldChangeSampleParameterTab ${sampleParameterTypeClass}`}
        >
          {tabHeader}
        </span>
        <HelpIcon>{safeHtml(parameter.help)}</HelpIcon>
        <div
          className={`wdk-FoldChangeSampleParameterContainer ${sampleParameterTypeClass}`}
        >
          <ResizableContainer
            alsoResize={`.wdk-FoldChangeSampleParameterContainer.${sampleParameterTypeClass} .wdk-CheckboxList > div:first-child, .wdk-FoldChangeSampleParameterContainer.${sampleParameterTypeClass} .wdk-CheckboxTree`}
            handles="s"
            minHeight={120}
          >
            {parameterElement}
          </ResizableContainer>
        </div>
      </div>
    );

export const ReferenceSampleParameterPane = sampleParameterPane(
  'wdk-FoldChangeReferenceSample',
  'Reference Samples'
);
export const ComparisonSampleParameterPane = sampleParameterPane(
  'wdk-FoldChangeComparisonSample',
  'Comparison Samples'
);
