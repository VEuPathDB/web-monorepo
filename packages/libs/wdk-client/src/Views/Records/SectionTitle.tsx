import React from 'react';

import { IconAlt } from '../../Components';
import { Tooltip } from '@veupathdb/coreui';
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
          <Tooltip title={safeHtml(help)} style={{ paddingLeft: 4 }}>
            <div className="HelpTrigger">
              <IconAlt fa="question-circle" />
            </div>
          </Tooltip>
        </>
      )}
    </>
  );
}
