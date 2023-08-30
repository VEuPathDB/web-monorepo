import React, { ReactNode } from 'react';

import { HelpIcon } from '@veupathdb/wdk-client/lib/Components';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { Parameter } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

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
  hideParameter?: boolean;
}

export const ParamLine: React.FunctionComponent<ParamLineProps> = ({
  preParameterContent,
  parameterElement,
  parameter,
  postParameterContent,
  hideParameter,
}) => (
  <div>
    {preParameterContent}
    {parameterElement}
    {parameterElement && !hideParameter && (
      <HelpIcon>
        <> {safeHtml(parameter.help)}</>
      </HelpIcon>
    )}
    {hideParameter && (
      <HelpIcon>
        <> {safeHtml(parameter.help)}</>
      </HelpIcon>
    )}
    {postParameterContent}
  </div>
);
