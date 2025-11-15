import React, { ReactNode } from 'react';
import Link from '../../Components/Link/Link';
import { wrappable } from '../../Utils/ComponentUtils';
import { RecordClass, PrimaryKey } from '../../Utils/WdkModel';

interface RecordLinkProps {
  recordId: PrimaryKey;
  recordClass: RecordClass;
  children?: ReactNode;
  className?: string;
}

function RecordLink(props: RecordLinkProps) {
  let { recordClass, recordId, className } = props;
  let pkValues = recordId.map((p) => p.value).join('/');

  return (
    <Link
      to={`/record/${recordClass.urlSegment}/${pkValues}`}
      className={className}
    >
      {props.children}
    </Link>
  );
}

export default wrappable(RecordLink);
