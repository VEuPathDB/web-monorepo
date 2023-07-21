import React from 'react';

import { compose } from 'lodash/fp';

import { IconAlt as Icon, Mesa } from '@veupathdb/wdk-client/lib/Components';
import { wrappable } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { attemptAction } from '@veupathdb/study-data-access/lib/data-restriction/DataRestrictionActionCreators';
import { connect } from 'react-redux';
import { isPrereleaseStudy } from '@veupathdb/study-data-access/lib/data-restriction/DataRestrictionUtils';

function DownloadLink(props) {
  const {
    attemptAction,
    studyAccess,
    studyId,
    studyUrl,
    permissions,
    className,
    linkText = '',
    iconFirst = false,
  } = props;
  const myDownloadTitle = 'Download data files';
  return (
    <div className={className}>
      {!isPrereleaseStudy(studyAccess, studyId, permissions) ? (
        <Mesa.AnchoredTooltip fadeOut content={myDownloadTitle}>
          <button
            type="button"
            className="link"
            onClick={(event) => {
              const { ctrlKey } = event;
              attemptAction('download', {
                studyId: studyId,
                onAllow: () => {
                  if (ctrlKey) window.open(studyUrl, '_blank');
                  else window.location.assign(studyUrl);
                },
              });
            }}
          >
            {iconFirst ? (
              <>
                <i className="ebrc-icon-download" /> {linkText}
              </>
            ) : (
              <>
                {linkText} <Icon fa="download" />
              </>
            )}
          </button>
        </Mesa.AnchoredTooltip>
      ) : (
        <span>&nbsp;</span>
      )}
    </div>
  );
}
// expression (not declaration): we are calling connect
// arg1: mapStateToProps: take state from store and pass to component as props
// arg2: mapDispatchToProps: pass an object with one property 'attemptAction' which is an actionCreator (because it returns a run() function) see DataRestrictionActionCreators
// attemptAction gets bound to the store, the store receives the action, which will get executed when user clicks.
export default compose(
  wrappable,
  connect(null, { attemptAction })
)(DownloadLink);
