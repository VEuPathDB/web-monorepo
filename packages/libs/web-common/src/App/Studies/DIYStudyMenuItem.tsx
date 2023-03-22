import React, { ReactNode } from 'react';

import { Link } from '@veupathdb/wdk-client/lib/Components';

interface Props {
  name: ReactNode;
  link: string;
}

export function DIYStudyMenuItem({
  name,
  link,
}: Props) {
  return (
    <div className="row StudyMenuItem">
      <div className="box StudyMenuItem-Name">
        <Link to={link} className="StudyMenuItem-RecordLink">
          <i className="ebrc-icon-edaIcon"></i>
          {' '}
          {name}
        </Link>
      </div>
    </div>
  );
}
