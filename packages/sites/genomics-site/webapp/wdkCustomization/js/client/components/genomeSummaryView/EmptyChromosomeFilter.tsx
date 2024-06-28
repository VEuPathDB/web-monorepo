import React, { ChangeEvent } from 'react';

interface EmptyChromosomesFilterProps {
  applied: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export const EmptyChromosomesFilter: React.FunctionComponent<EmptyChromosomesFilterProps> =
  ({ applied, onChange }) => (
    <div id="emptyChromosomes">
      <input type="checkbox" checked={applied} onChange={onChange} /> Show empty
      chromosomes
    </div>
  );
