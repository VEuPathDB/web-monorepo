import React, { ReactNode } from 'react';

import { Link } from '@veupathdb/wdk-client/lib/Components';

interface Props {
  name: ReactNode;
  link: string;
  isChildOfCollapsibleSection: boolean;
}

export function DIYStudyMenuItem({
  name,
  link,
  isChildOfCollapsibleSection = false,
}: Props) {
  return (
    <div className="row StudyMenuItem" key={link}>
      <div
        className={`box StudyMenuItem-Name ${
          isChildOfCollapsibleSection ? ' CollapsibleSectionChild' : ''
        }`}
      >
        <Link to={link} className="StudyMenuItem-RecordLink">
          <i className="ebrc-icon-edaIcon"></i> {name}
        </Link>
      </div>
    </div>
  );
}
