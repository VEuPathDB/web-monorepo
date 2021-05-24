import { DefaultValue, atom, selector } from 'recoil';

import { debounce, memoize } from 'lodash';

import { WdkService } from '@veupathdb/wdk-client/lib/Core';
import { WdkDependencies } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import {
  Unpack,
  arrayOf,
  decodeOrElse,
  number,
  record,
  string,
} from '@veupathdb/wdk-client/lib/Utils/Json';
import { foldStructure } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { TreeBoxVocabNode } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

import { pruneNodesWithSingleExtendingChild } from '@veupathdb/web-common/lib/util/organisms';

import { findAvailableOrganisms } from './configTrees';
import {
  makeOrganismMetadataRecoilState,
  OrganismMetadata,
} from './organismMetadata';

export const ORGANISM_PREFERENCE_KEY = 'organism_preference';
export const ORGANISM_PREFERENCE_SCOPE = 'project';

export const makePreferredOrganismsRecoilState = memoize(
  (wdkDependencies: WdkDependencies | undefined) => {
    if (wdkDependencies == null) {
      throw new Error(
        'To use Preferred Organisms, WdkDependenciesContext must be configured.'
      );
    }

    const { wdkService } = wdkDependencies;

    const { organismMetadata } = makeOrganismMetadataRecoilState(
      wdkDependencies
    );

    const config = selector({
      key: 'wdk-service-config',
      get: () => wdkService.getConfig(),
    });

    const projectId = selector({
      key: 'project-id',
      get: ({ get }) => get(config).projectId,
    });

    const buildNumber = selector({
      key: 'build-number',
      get: ({ get }) => {
        const buildNumberStr = get(config).buildNumber;

        return Number(buildNumberStr);
      },
    });

    const fullOrganismTree = selector({
      key: 'full-organism-tree',
      get: () => fetchOrganismTree(wdkService),
    });

    const organismTree = selector({
      key: 'organism-tree',
      get: ({ get }) =>
        pruneNodesWithSingleExtendingChild(get(fullOrganismTree)),
    });

    const availableOrganisms = selector({
      key: 'available-organisms',
      get: ({ get }) => findAvailableOrganisms(get(organismTree)),
    });

    const initialOrganismPreference = selector({
      key: 'initial-organism-preference',
      get: ({ get }) =>
        fetchPreferredOrganisms(wdkService, get(availableOrganisms)),
    });

    const organismPreference = atom({
      key: 'organism-preference',
      default: initialOrganismPreference,
      effects_UNSTABLE: [
        ({ onSet }) => {
          function onPreferredOrganismsChange(
            newOrganismPreference: OrganismPreference | DefaultValue
          ) {
            if (!(newOrganismPreference instanceof DefaultValue)) {
              updatePreferredOrganisms(wdkService, newOrganismPreference);
            }
          }

          onSet(
            debounce(onPreferredOrganismsChange, 2000, {
              leading: true,
              trailing: true,
            })
          );
        },
      ],
    });

    const preferredOrganisms = selector({
      key: 'preferred-organisms',
      get: ({ get }) => get(organismPreference).organisms,
      set: (
        { get, reset, set },
        newPreferredOrganisms: string[] | DefaultValue
      ) => {
        if (newPreferredOrganisms instanceof DefaultValue) {
          reset(organismPreference);
        } else {
          set(organismPreference, {
            ...get(organismPreference),
            organisms: newPreferredOrganisms,
          });
        }
      },
    });

    const organismPreferenceBuildNumber = selector({
      key: 'organism-preference-build-number',
      get: ({ get }) => get(organismPreference).buildNumber,
    });

    const newOrganisms = selector({
      key: 'new-organisms',
      get: ({ get }) =>
        findNewOrganisms(
          get(availableOrganisms),
          get(organismMetadata),
          get(organismPreferenceBuildNumber)
        ),
    });

    const preferredOrganismsEnabled = atom({
      key: 'only-show-preferred-organisms',
      default: true,
    });

    const preferredSpecies = selector({
      key: 'preferred-species',
      get: ({ get }) =>
        findPreferredSpecies(get(fullOrganismTree), get(preferredOrganisms)),
    });

    return {
      availableOrganisms,
      buildNumber,
      newOrganisms,
      organismPreference,
      organismPreferenceBuildNumber,
      organismTree,
      preferredOrganisms,
      preferredOrganismsEnabled,
      preferredSpecies,
      projectId,
    };
  }
);

// FIXME: DRY this up by porting to @veupathdb/web-common
// TODO Make these configurable via model.prop, and when not defined, always return an empty tree.
// This way non-genomic sites can call this without effect, while keeping the thrown error if
// the configuered search/param are not available.
const TAXON_QUESTION_NAME = 'SequencesByTaxon';
const ORGANISM_PARAM_NAME = 'organism';

async function fetchOrganismTree(wdkService: WdkService) {
  const taxonQuestion = await wdkService.getQuestionAndParameters(
    TAXON_QUESTION_NAME
  );
  const orgParam = taxonQuestion.parameters.find(
    (p) => p.name === ORGANISM_PARAM_NAME
  );

  if (
    orgParam?.type === 'multi-pick-vocabulary' &&
    orgParam?.displayType === 'treeBox'
  ) {
    return orgParam.vocabulary;
  }

  throw new Error(
    TAXON_QUESTION_NAME +
      ' does not contain treebox enum param ' +
      ORGANISM_PARAM_NAME
  );
}

async function fetchPreferredOrganisms(
  wdkService: WdkService,
  availableOrganisms: Set<string>
) {
  const [buildNumber, userPreferences] = await Promise.all([
    fetchBuildNumber(wdkService),
    wdkService.getCurrentUserPreferences(),
  ]);

  const defaultPreferredOrganisms = {
    buildNumber,
    organisms: [...availableOrganisms],
  };

  const preferenceStr =
    userPreferences[ORGANISM_PREFERENCE_SCOPE][ORGANISM_PREFERENCE_KEY] ?? '';

  return decodeOrElse(
    organismPreference,
    defaultPreferredOrganisms,
    preferenceStr
  );
}

async function updatePreferredOrganisms(
  wdkService: WdkService,
  organismPreference: OrganismPreference
) {
  await wdkService.patchScopedUserPreferences(ORGANISM_PREFERENCE_SCOPE, {
    [ORGANISM_PREFERENCE_KEY]: JSON.stringify(organismPreference),
  });
}

async function fetchBuildNumber(wdkService: WdkService) {
  const buildNumberStr = (await wdkService.getConfig()).buildNumber;

  return Number(buildNumberStr);
}

function findNewOrganisms(
  availableOrganisms: Set<string>,
  organismMetadata: Map<string, OrganismMetadata>,
  organismPreferenceBuildNumber: number
) {
  const availableOrganismSet = new Set(availableOrganisms);

  return [...organismMetadata].reduce(
    (memo, [organism, { buildIntroduced }]) => {
      if (
        availableOrganismSet.has(organism) &&
        buildIntroduced > organismPreferenceBuildNumber
      ) {
        memo.add(organism);
      }

      return memo;
    },
    new Set<string>()
  );
}

function findPreferredSpecies(
  organismTree: TreeBoxVocabNode,
  preferredOrganisms: string[]
) {
  const preferredOrganismsSet = new Set(preferredOrganisms);

  return foldStructure(
    (preferredSpecies, node) => {
      if (
        node.children.some((child) =>
          preferredOrganismsSet.has(child.data.term)
        )
      ) {
        preferredSpecies.add(node.data.term);
      }

      return preferredSpecies;
    },
    new Set<string>(),
    organismTree
  );
}

const organismPreference = record({
  buildNumber: number,
  organisms: arrayOf(string),
});

type OrganismPreference = Unpack<typeof organismPreference>;
