import React from 'react';

import { IconAlt, Tooltip } from 'wdk-client/Components';
import { safeHtml } from 'wdk-client/Utils/ComponentUtils';

interface Props {
  displayName: string;
  help?: string;
}

export function DefaultSectionTitle({ displayName, help }: Props) {
  return (
    <>
      {displayName}
      {
        help &&
        <>
          &nbsp;
          <Tooltip content={safeHtml(help)}>
            <div className="HelpTrigger">
              <IconAlt fa="question-circle" />
            </div>
          </Tooltip>
        </>
      }
    </>
  );
}

