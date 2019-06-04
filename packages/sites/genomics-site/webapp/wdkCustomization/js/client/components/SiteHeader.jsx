import React from 'react';
import ClassicSiteHeader from 'ebrc-client/components/ClassicSiteHeader';

import makeMainMenuItems from '../mainMenuItems';
import makeSmallMenuItems from '../smallMenuItems';

const quickSearchReferences = [
  {
    name: 'GeneQuestions.GeneBySingleLocusTag',
    alternate: 'GeneQuestions.GeneByLocusTag',
    paramName: 'single_gene_id',
    displayName: 'Gene ID',
    help: `Use * as a wildcard in a gene ID. <br/>To enter multiple IDs click on <b>Gene ID:</b> to go to the <a href='/showQuestion.do?questionFullName=GeneQuestions.GeneByLocusTag'>Gene IDs</a> search page.`,
  },
  {
    name: 'GeneQuestions.GenesByTextSearch',
    paramName: 'text_expression',
    displayName: 'Gene Text Search',
    help: `
      <b>Examples:</b>
      <ul>
        <li>chloroplast plastid</li>
        <li>"Histone H3"</li>
        <li>kinase</li>
        <li>kinas*</li>
        <li>kin*as*</li>
      </ul <br/><br/>To query a list of genes with Gene ID(s) use the search  <a href='/showQuestion.do?questionFullName=GeneQuestions.GeneByLocusTag'>Gene ID(s)</a> under "Annotation, curation, and identifiers" (in the "New Search" menu or in the home page bubble). 
    `
    // help: `Use * as a wildcard, as in *inase, kin*se, kinas*. Do not use AND, OR. Use quotation marks to find an exact phrase. Click on 'Gene Text Search' to access the advanced gene search page.`,
  }
];


export default function SiteHeader() {
  return (
    <ClassicSiteHeader
      makeMainMenuItems={makeMainMenuItems}
      makeSmallMenuItems={makeSmallMenuItems}
      quickSearchReferences={quickSearchReferences}
    />
  )
}

