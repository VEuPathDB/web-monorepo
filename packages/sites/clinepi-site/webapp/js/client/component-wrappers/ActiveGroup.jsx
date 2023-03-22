import React from 'react';
import RelativeVisitsGroup from '../components/RelativeVisitsGroup';
import RelatedCaseControlGroup from '../components/RelatedCaseControlGroup';

export default ActiveGroup => props => {
  // Attempt to get the relative observations layout settings and determine
  // if the active group should use the layout. If not, use the default layout.
  return RelativeVisitsGroup.shouldUseLayout(props)
    ? <RelativeVisitsGroup {...props} DefaultComponent={ActiveGroup} />
    : RelatedCaseControlGroup.shouldUseLayout(props)
      ? <RelatedCaseControlGroup {...props} DefaultComponent={ActiveGroup} />
      : <ActiveGroup {...props} />
}