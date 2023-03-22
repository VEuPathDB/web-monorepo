import React from 'react';

import { Link } from '@veupathdb/wdk-client/lib/Components';

export default function Home() {
  return (
    <div>
      <h1>Welcome to the VEuPathDB development environment.</h1>
      <div style={{ fontSize: '1.2em' }}>
        <p>To get started, follow these steps:</p>
        <ul>
          <li>
            Put your feature code in <code>src/lib</code>
          </li>
          <li>
            Add and modify routes in <code>src/index.tsx</code>
          </li>
          <li>
            Configure external services in <code>src/setupProxy.js</code>
          </li>
        </ul>
        <p>Work under development:</p>
        <ul>
          <li>
            <Link to="/workspace/blast/new">BLAST workspace</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
