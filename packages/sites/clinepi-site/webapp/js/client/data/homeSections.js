import React from 'react';

import studies from 'Client/data/studies.json';
import searches from 'Client/data/searches.json';
import visualizations from 'Client/data/visualizations.json';

export default [
  {
    title: 'Explore the Studies',
    viewAllUrl: '#viewAll',
    contentType: 'StudyCardList',
    items: studies
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
];
