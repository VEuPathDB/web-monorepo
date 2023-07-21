import React from 'react';
import ClassicSiteHeader from '@veupathdb/web-common/lib/components/ClassicSiteHeader';

import makeMainMenuItems from '../mainMenuItems';
import makeSmallMenuItems from '../smallMenuItems';

const quickSearchReferences = [
  {
    name: 'GeneBySingleLocusTag',
    recordClassName: 'transcript',
    alternate: 'GeneByLocusTag',
    paramName: 'single_gene_id',
    displayName: 'Gene ID',
    linkTemplate: '/record/gene/{value}',
    help: `Use * as a wildcard in a gene ID. <br/>To enter multiple IDs click on <b>Gene ID:</b> to go to the <a href='/showQuestion.do?questionFullName=GeneQuestions.GeneByLocusTag'>Gene IDs</a> search page.`,
  },
  {
    name: 'GenesByTextSearch',
    recordClassName: 'transcript',
    paramName: 'text_expression',
    displayName: 'Gene Text Search',
    isDisabled: true,
    help: `
      <strong><em>Site search coming soon...</em></strong>
      <p>
      To query a list of genes with Gene ID(s) use the search  <a href='/showQuestion.do?questionFullName=GeneQuestions.GeneByLocusTag'>Gene ID(s)</a> under "Annotation, curation, and identifiers" (in the "New Search" menu or in the home page bubble). 
      </p>
    `,
    // help: `Use * as a wildcard, as in *inase, kin*se, kinas*. Do not use AND, OR. Use quotation marks to find an exact phrase. Click on 'Gene Text Search' to access the advanced gene search page.`,
  },
];

export default function SiteHeader() {
  return (
    <ClassicSiteHeader
      makeMainMenuItems={makeMainMenuItems}
      makeSmallMenuItems={makeSmallMenuItems}
      quickSearchReferences={quickSearchReferences}
    />
  );
}
