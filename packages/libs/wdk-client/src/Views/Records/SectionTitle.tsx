import React from 'react';

import { IconAlt, Tooltip } from '../../Components';
import { safeHtml } from '../../Utils/ComponentUtils';

interface Props {
  displayName: string;
  help?: string;
}

export function DefaultSectionTitle({ displayName, help }: Props) {
  return (
    <>
      {displayName}
      {help && (
        <>
          &nbsp;
          <Tooltip content={safeHtml(help)}>
            <div className="HelpTrigger">
              <IconAlt fa="question-circle" />
            </div>
          </Tooltip>
        </>
      )}
    </>
  );
}
