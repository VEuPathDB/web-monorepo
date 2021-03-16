import React, { useState } from 'react';

interface Props {}

interface Visualization {
  title: string;
  component: React.ComponentType;
}

const visualizations: Record<string, Visualization> = {
  histogram: {
    title: 'Histogram',
    component: NotImplemented,
  },
};

export function PassThroughApp(props: Props) {
  const [selectedVizName, setSelectedVizName] = useState('none');
  const selectedViz = visualizations[selectedVizName];
  return (
    <div>
      <h3>Choose a visualization</h3>
      <select
        value={selectedVizName}
        onChange={(e) => setSelectedVizName(e.target.value)}
      >
        <option value="none"></option>
        {Object.entries(visualizations).map(([key, visualization]) => (
          <option key={key} value={key}>
            {visualization.title}
          </option>
        ))}
      </select>
      <hr />
      {selectedViz && (
        <div>
          <h4>{selectedViz.title}</h4>
          <selectedViz.component />
        </div>
      )}
    </div>
  );
}

function NotImplemented() {
  return <div>This visualization has not been implemented.</div>;
}
