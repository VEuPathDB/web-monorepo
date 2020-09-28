import React, { useEffect, useState } from 'react';

import { RealTimeSearchBox } from 'wdk-client/Components';

import { NodeSearchCriteria } from './pathway-utils';

interface Props {
  onSearchCriteriaChange: (searchCriteria: NodeSearchCriteria | undefined) => void;
}

export function PathwaySearchSelector({ onSearchCriteriaChange }: Props) {
  const [ searchTerm, setSearchTerm ] = useState('');

  useEffect(() => {
    if (searchTerm.length === 0) {
      onSearchCriteriaChange(undefined);
    } else {
      onSearchCriteriaChange(
        `node[node_identifier @*= '${searchTerm}'], node[name @*= '${searchTerm}']`
      );
    }
  }, [ searchTerm ]);

  return (
    <RealTimeSearchBox
      autoFocus
      searchTerm={searchTerm}
      onSearchTermChange={setSearchTerm}
      placeholderText="Search IDs and names"
      helpText="Nodes whose ID or name contains your search term will be highlighted"
    />
  );
}
