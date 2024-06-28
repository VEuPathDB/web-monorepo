import React from 'react';
import { TextBox } from '@veupathdb/wdk-client/lib/Components';

interface PubmedIdSearchFieldProps {
  query: string;
  onChange: (newQuery: string) => void;
  className?: string;
}

export const PubmedIdSearchField: React.FunctionComponent<PubmedIdSearchFieldProps> =
  ({ query, onChange, className }) => (
    <div className={className}>
      <button
        type="button"
        onClick={() => {
          if (query.trim() === '') {
            alert('Please enter a search term.');
            return;
          }
          const newWindow = window.open(
            `http://www.ncbi.nlm.nih.gov/pubmed?term=${query}`,
            '_blank'
          );
          if (newWindow !== null) {
            newWindow.focus();
          }
        }}
      >
        Search for PubMed ID(s)
      </button>
      <TextBox
        onChange={onChange}
        value={query}
        placeholder="<enter valid gene ID>"
      />
    </div>
  );
