import React from 'react';

export function getCategoryColor(category) {
  if (!category) return null;
  switch (category.toLowerCase()) {
    // This contains a mix of disease variables from https://webprotege.stanford.edu/#projects/719dd1bd-ffbb-4c15-99cc-050a233977ee/edit/Classes?selection=Class(%3Chttp://purl.obolibrary.org/obo/DOID_4%3E),
    // non-standard disease names, and sample types
    case 'enteric':
    case 'diarrhea':
    case 'diarrheal disease':
      return '#6738ff'; //#8874a3'; more muted
    case 'hiv':
    case 'aids':
      return '#cb2b39';
    case 'malarial':
    case 'malaria':
      return '#ff6d0d';
    case 'tuberculosis':
    case 'respiratory':
    case 'respiratory condition':
      return '#00aedb';
    case 'schistosomiasis':
      return '#7bc043';
    case 'mixed':
      return '#00aedb';

    case 'human':
      return '#6738ff';
    case 'insect':
      return '#ff6d0d';
    case 'veterinary':
      return '#ffb6c1';
    case 'rodent':
      return '#7bc043';
    default:
      return '#9b9c9c';
  }
}

export function getCategoryName(category = '') {
  switch (category.toLowerCase()) {
    case 'malarial':
    case 'malaria':
      return (
        <span>
          A <b>Malaria</b> Study
        </span>
      );
    case 'enteric':
      return (
        <span>
          An <b>Enteric</b> Disease Study
        </span>
      );
    case 'respiratory':
      return (
        <span>
          A <b>Respiratory</b> Disease Study
        </span>
      );
    case 'schistosomiasis':
      return (
        <span>
          A <b>Schistosomiasis</b> Study
        </span>
      );
    default:
      return (
        <span>
          An <b>Epidemiological</b> Study
        </span>
      );
  }
}
