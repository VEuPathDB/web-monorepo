import React from 'react';
import ClassicSiteHeader from '@veupathdb/web-common/lib/components/ClassicSiteHeader';

import makeMainMenuItems from '../mainMenuItems';
import makeSmallMenuItems from '../smallMenuItems';

// FIXME: 'name' references below rightly use a full name; however they
//   illustrate that the OrthoMCL Model is no longer with new code- the
//   name/urlSegment must be unique but ByTextSearch is duplicated
const quickSearchReferences = [
  {
    name: 'GroupQuestions.ByTextSearch',
    paramName: 'text_expression',
    displayName: 'Groups Quick Search',
    help: `Use * as a wildcard, as in *inase, kin*se, kinas*. Do not use AND, OR. Use quotation marks to find an exact phrase. Click on 'Groups Quick Search' to access the advanced group search page.`
  },
  {
    name: 'SequenceQuestions.ByTextSearch',
    paramName: 'text_expression',
    displayName: 'Sequences Quick Search',
    help: `Use * as a wildcard, as in *inase, kin*se, kinas*. Do not use AND, OR. Use quotation marks to find an exact phrase. Click on 'Sequences Quick Search' to access the advanced sequence search page.`
  }
];

export default function SiteHeader() {
  return (
    <ClassicSiteHeader
      includeQueryGrid={false}
      makeMainMenuItems={makeMainMenuItems}
      makeSmallMenuItems={makeSmallMenuItems}
      quickSearchReferences={quickSearchReferences}
    />
  )
}
