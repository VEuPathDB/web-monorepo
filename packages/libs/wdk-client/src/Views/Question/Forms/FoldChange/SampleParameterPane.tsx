import React, { ReactNode } from 'react';

import { ResizableContainer } from 'wdk-client/Components'

type ResizingOptions = JQueryUI.ResizableOptions;

interface SampleParameterPaneProps {
  tabHeader: ReactNode;
  parameterElement: ReactNode;
  resizingOptions?: ResizingOptions;
  className?: string;
}

export const SampleParameterPane: React.FunctionComponent<SampleParameterPaneProps> = ({
  tabHeader,
  parameterElement,
  resizingOptions,
  className
}) => 
  <div className={className}>
    in the following <span>{tabHeader}</span>
    <ResizableContainer {...resizingOptions}>
      {parameterElement}
    </ResizableContainer>
  </div>;
