import React, { ReactNode } from 'react';

import { HelpIcon }  from 'wdk-client/Components';
import { Parameter } from 'wdk-client/Utils/WdkModel';

export interface PreAndPostParameterEntries {
  preParameterContent: ReactNode;
  parameterName: string;
  postParameterContent: ReactNode;
}

interface ParamLineProps {
  preParameterContent: ReactNode;
  parameterElement: ReactNode;
  parameter: Parameter;
  postParameterContent: ReactNode;
}

export const ParamLine: React.FunctionComponent<ParamLineProps> = ({
  preParameterContent,
  parameterElement,
  parameter,
  postParameterContent
}) => (
  <div>
    {preParameterContent}
    {parameterElement}
    {parameterElement && (
      <HelpIcon>
        <>
          {' '}{parameter.help}
        </>
      </HelpIcon>
    )}
    {postParameterContent}
  </div>
);
