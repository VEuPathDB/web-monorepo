import React from 'react';

export default function GalaxyPageLayout(props) {
  return (
    <div id="eupathdb-GalaxyTerms">
      <h1>Analyze My Experimental Data</h1>
      {props.children}
    </div>
  );
}
