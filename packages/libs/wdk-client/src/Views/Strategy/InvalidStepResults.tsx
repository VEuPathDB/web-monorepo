import React from 'react';
import { Link } from '../../Components';

interface Props {}

const style: React.CSSProperties = {
  fontSize: '1.2em',
  border: '3px solid darkred',
  borderRadius: '.5em',
  padding: '1em',
  backgroundColor: '#ff00000f',
};

export default function InvalidStepResults(props: Props) {
  return (
    <div style={style}>
      <p>This strategy contains steps that are outdated.</p>
      <ul>
        <li>These steps are marked with a red X.</li>
        <li>
          To update the search parameters, hover over a step and click the
          "Edit" button that appears. Then, in the dialog that opens, click
          "Revise".
        </li>
      </ul>
      <p>
        <em>
          <strong>Warning</strong>: If a step contains an obsolete search, you
          will not be able to revise the step; you can only delete the step.
          Currently, such a strategy cannot be modified. Instead, you will have
          to recreate the strategy. Please{' '}
          <Link to="/contact-us">contact us</Link> if we can help with this.
        </em>
      </p>
    </div>
  );
}
