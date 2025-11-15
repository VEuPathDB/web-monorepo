import React, { ReactNode } from 'react';
import { RecordClass, RecordInstance } from '../../Utils/WdkModel';
import { safeHtml, wrappable } from '../../Utils/ComponentUtils';
import RecordActionLink from '../../Views/Records/RecordActionLink';

export interface HeaderAction {
  className?: string;
  iconClassName?: string;
  onClick?: () => void;
  href?: string;
  label?: string;
  showLabel?: boolean;
  external?: boolean;
}

export interface RecordHeadingProps {
  record: RecordInstance;
  recordClass: RecordClass;
  headerActions: HeaderAction[];
  displayName?: ReactNode;
}

const RecordHeading: React.FC<RecordHeadingProps> = (props) => {
  const {
    record,
    recordClass,
    headerActions,
    displayName = (
      <>
        {recordClass.displayName}: {safeHtml(record.displayName)}
      </>
    ),
  } = props;
  return (
    <>
      <ul className="wdk-RecordActions">
        {headerActions.map((action, index) => {
          return (
            <li key={index} className="wdk-RecordActionItem">
              <RecordActionLink {...props} {...action} />
            </li>
          );
        })}
      </ul>
      <h1 className="wdk-RecordHeading">{displayName}</h1>
    </>
  );
};

export default wrappable(RecordHeading);
