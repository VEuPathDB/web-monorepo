import React from 'react';

interface GalaxyPageLayoutProps {
  children: React.ReactNode;
}

export default function GalaxyPageLayout(props: GalaxyPageLayoutProps) {
  return (
    <div id="eupathdb-GalaxyTerms">
      <h1>Analyze My Experimental Data</h1>
      {props.children}
    </div>
  );
}
