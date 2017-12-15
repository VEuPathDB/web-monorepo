import React from 'react';

import Studies from 'Client/data/studies.json';
import Searches from 'Client/data/searches.json';
import Visualizations from 'Client/data/visualizations.json';

import { injectWebappUrl, getStudyCategoryFilters } from 'Client/App/StudyCard/StudyUtils';

export default (webappUrl = '') => {
  const studies = injectWebappUrl(Studies, webappUrl);
  const searches = injectWebappUrl(Searches, webappUrl);
  const visualizations = injectWebappUrl(Visualizations, webappUrl);

  return [
    {
      title: 'Explore the Studies',
      viewAllUrl: '#viewAll',
      contentType: 'StudyCardList',
      items: studies,
      filters: getStudyCategoryFilters(studies)
    },
    {
      title: 'Explore Example Searches',
      description: 'ClinEpiDB’s Epidemiological Studies can be explored using various tools and refinements. Use the search types and strategies below to get acquainted with our tools.',
      viewAllUrl: '#viewAll',
      contentType: 'SearchCardList',
      items: searches
    },
    {
      title: 'Explore Visualization Tools',
      description: 'Gain clear insights into your data and illustrate powerful connections using our visualization tools. Use the demonstration visualizations below to get acquainted with our tools.',
      viewAllUrl: '#viewAll',
      contentType: 'ImageCardList',
      items: visualizations
    }
  ]
};
