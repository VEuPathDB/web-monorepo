import { selector } from 'recoil';

import { memoize } from 'lodash';

import { WdkDependencies } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';

import {
  makeOrganismMetadataRecoilState,
  OrganismMetadata,
} from './organismMetadata';

export const makeReferenceStrainsRecoilState = memoize(
  (wdkDependencies: WdkDependencies | undefined) => {
    const { organismMetadata } = makeOrganismMetadataRecoilState(
      wdkDependencies
    );

    const referenceStrains = selector({
      key: 'reference-strains',
      get: ({ get }) => findReferenceStrains(get(organismMetadata)),
    });

    return {
      referenceStrains,
    };
  }
);

async function findReferenceStrains(
  organismMetadata: Map<string, OrganismMetadata>
) {
  return [...organismMetadata].reduce((memo, [name, { isReference }]) => {
    if (isReference) {
      memo.add(name);
    }

    return memo;
  }, new Set<string>());
}
