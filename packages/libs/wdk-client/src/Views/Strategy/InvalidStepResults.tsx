import React from 'react';

interface Props {
}

const style: React.CSSProperties = {
  fontSize: '1.2em',
  border: '3px solid darkred',
  borderRadius: '.5em',
  padding: '1em',
  backgroundColor: '#ff00000f'
}

export default function InvalidStepResults(props: Props) {
  return (
    <div style={style}>
      <p>This strategy contains steps that are outdated.</p>
      <ul>
        <li>These steps are marked with a red X.</li>
        <li>Click on the Edit button that appears as you mouseover a step, to open the dialog and click on "Revise" to update the search parameters.</li>
        <li>Watch this tutorial! YouTube icon.</li>
      </ul>
      <p>
        <em>Warning: if a step contains an obsolete search, you will no be offered the option to revise the step; only to delete it. Currently such a strategy cannot be modified: you will have to recreate the strategy. Please contact us if we can help with this.</em>
      </p>
    </div>
  );
}
