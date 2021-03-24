import { useRecoilValue } from 'recoil';

import { Link } from '@veupathdb/wdk-client/lib/Components';

import { preferredOrganisms } from '.';

export default function Home() {
  const preferredOrganismsValue = useRecoilValue(preferredOrganisms);

  return (
    <div style={{ fontSize: '1.2em' }}>
      <h1>Welcome to the VEuPathDB development environment.</h1>
      <div>
        To get started, follow these steps:
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
      </div>
      <div>
        <p>
          You have selected <strong>{preferredOrganismsValue.length}</strong>{' '}
          preferred organisms.{' '}
          <Link to="/preferred-organisms">
            Configure your preferred organisms?
          </Link>
        </p>
      </div>
    </div>
  );
}
