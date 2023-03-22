import { useMemo } from 'react';

import { Link } from '@veupathdb/wdk-client/lib/Components';

import { NewOrganismsBanner } from './lib/components/NewOrganismsBanner';

import { useOrganismMetadata } from './lib/hooks/organismMetadata';
import {
  useDisplayName,
  useNewOrganisms,
  usePreferredOrganismsState,
  usePreferredQuestions,
  usePreferredSpecies,
} from './lib/hooks/preferredOrganisms';
import { useReferenceStrains } from './lib/hooks/referenceStrains';

export default function Home() {
  const [preferredOrganisms] = usePreferredOrganismsState();
  const displayName = useDisplayName();

  const referenceStrains = useReferenceStrains();

  const referenceStrainsList = useMemo(() => [...referenceStrains].sort(), [
    referenceStrains,
  ]);

  const newOrganisms = useNewOrganisms();

  useOrganismMetadata();

  usePreferredQuestions();

  usePreferredSpecies();

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
          You have selected <strong>{preferredOrganisms.length}</strong>{' '}
          preferred organisms.{' '}
          <Link to="/preferred-organisms">
            Configure your preferred organisms?
          </Link>
        </p>
        <div style={{ margin: '1em 0' }}>
          <NewOrganismsBanner
            onDismiss={() => {}}
            newOrganismCount={newOrganisms.size}
            displayName={displayName}
          />
        </div>
        <div>
          These are the reference strains for {displayName}:
          <ul>
            {referenceStrainsList.map((referenceStrain) => (
              <li key={referenceStrain}>{referenceStrain}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
