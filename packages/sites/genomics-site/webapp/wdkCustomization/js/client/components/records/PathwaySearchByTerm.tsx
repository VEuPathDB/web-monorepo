import React, { useEffect, useState } from 'react';

import { RealTimeSearchBox } from 'wdk-client/Components';
import { stripHTML } from 'wdk-client/Views/Records/RecordUtils';

import { NodeSearchCriteria } from './pathway-utils';

interface Props {
  onSearchCriteriaChange: (searchCriteria: NodeSearchCriteria | undefined) => void;
}

export function PathwaySearchByTerm({ onSearchCriteriaChange }: Props) {
  const [ searchTerm, setSearchTerm ] = useState('');

  useEffect(() => {
    if (searchTerm.length === 0) {
      onSearchCriteriaChange(undefined);
    } else {
      onSearchCriteriaChange(node => {
        const normalizedSearchTerm = searchTerm.toLowerCase();

        const name = typeof node.data('name') === 'string' ? stripHTML(node.data('name')) : undefined;
        const nodeIdentifier = typeof node.data('node_identifier') === 'string' ? node.data('node_identifier') : undefined;

        return (
          name?.toLowerCase().includes(normalizedSearchTerm) ||
          nodeIdentifier?.toLowerCase().includes(normalizedSearchTerm)
        );
      });
    }
  }, [ searchTerm ]);

  return (
    <div className="veupathdb-PathwaySearchByTerm">
      <RealTimeSearchBox
        autoFocus
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        placeholderText="Search IDs and names"
        helpText="Nodes whose ID or name contains your search term will be highlighted"
      />
    </div>
  );
}
