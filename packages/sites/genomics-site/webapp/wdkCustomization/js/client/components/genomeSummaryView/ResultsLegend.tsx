import React from 'react';

interface ResultsLegendProps {
  displayNamePlural: string;
}

export const ResultsLegend: React.SFC<ResultsLegendProps> = ({
  displayNamePlural,
}) => (
  <div className="legend">
    <div>
      {' '}
      <div className="icon feature forward"> </div> {displayNamePlural} on
      forward strand;
    </div>
    <div>
      {' '}
      <div className="icon feature reversed"> </div> {displayNamePlural} on
      reversed strand;
    </div>
  </div>
);
