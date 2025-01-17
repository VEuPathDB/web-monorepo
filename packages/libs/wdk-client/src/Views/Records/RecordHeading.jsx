import React from 'react';
import PropTypes from 'prop-types';
import { safeHtml, wrappable } from '../../Utils/ComponentUtils';
import RecordActionLink from '../../Views/Records/RecordActionLink';

let RecordHeading = (props) => {
  let {
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

RecordHeading.propTypes = {
  record: PropTypes.object.isRequired,
  recordClass: PropTypes.object.isRequired,
  headerActions: PropTypes.arrayOf(PropTypes.object),
};

export default wrappable(RecordHeading);
