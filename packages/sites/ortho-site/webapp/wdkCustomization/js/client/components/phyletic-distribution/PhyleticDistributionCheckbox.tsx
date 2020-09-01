import React from 'react';

import { TaxonTree } from 'ortho-client/utils/taxons';

interface Props {
  selectionConfig: SelectionConfig;
  speciesCounts: Record<string, number>;
  taxonTree: TaxonTree;
}

type SelectionConfig =
  | {
      selectable: false
    }
  | {
      selectable: true,
      onSpeciesSelected: (selection: string[]) => void;
    };

export function PhyleticDistributionCheckbox(props: Props) {
  return (
    <div className="PhyleticDistributionCheckbox">
      Future home of the Phyletic Distribution checkbox
    </div>
  );
}
