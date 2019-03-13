import React from 'react';
import { TextBox } from 'wdk-client/Components';

interface PubmedIdSearchFieldProps {
  query: string;
  onChange: (newQuery: string) => void;
  className?: string;
}

export const PubmedIdSearchField: React.SFC<PubmedIdSearchFieldProps> = ({
  query,
  onChange,
  className
}) => (
  <div className={className}>
    <button type="button" onClick={() => {
      if (query.trim() === '') {
        alert("Please enter a search term.");
      }
      const newWindow = window.open(`http://www.ncbi.nlm.nih.gov/pubmed?term=${query}`,'_blank');
      if (window.focus && newWindow !== null) {
        newWindow.focus()
      }
    }}>Search for PubMed ID(s)</button>
    <TextBox onChange={onChange} value={query} />
  </div>
);
