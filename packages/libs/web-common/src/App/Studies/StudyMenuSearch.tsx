import React from 'react';
import { RealTimeSearchBox } from '@veupathdb/wdk-client/lib/Components';

interface Props {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
}

export default function StudyMenuSearch(props: Props) {
  return (
    <RealTimeSearchBox
      searchTerm={props.searchTerm}
      onSearchTermChange={props.onSearchTermChange}
      placeholderText="Filter the studies below..."
    />
  );
}
