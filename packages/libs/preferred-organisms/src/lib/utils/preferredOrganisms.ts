import { DefaultValue, atom, selector } from 'recoil';

import { debounce } from 'lodash';

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
import { pruneNodesWithSingleExtendingChild } from '@veupathdb/web-common/lib/util/organisms';

import { findAvailableOrganisms } from './configTrees';

export const ORGANISM_PREFERENCE_KEY = 'organism_preference';
export const ORGANISM_PREFERENCE_SCOPE = 'project';

export function makePreferredOrganismsRecoilState(
  wdkDependencies: WdkDependencies | undefined
) {
  if (wdkDependencies == null) {
    throw new Error(
      'To use Preferred Organisms, WdkDependendenciesContext must be configured.'
    );
  }

  const { wdkService } = wdkDependencies;

  const config = selector({
    key: 'wdk-service-config',
    get: () => wdkService.getConfig(),
  });

  const projectId = selector({
    key: 'project-id',
    get: ({ get }) => get(config).projectId,
  });

  const organismTree = selector({
    key: 'organism-tree',
    get: () => fetchOrganismTree(wdkService),
  });

  const availableOrganisms = selector({
    key: 'available-organisms',
    get: ({ get }) => findAvailableOrganisms(get(organismTree)),
  });

  const initialOrganismsPreference = selector({
    key: 'initial-organisms-preference',
    get: ({ get }) =>
      fetchPreferredOrganisms(wdkService, get(availableOrganisms)),
  });

  const initialPreferredOrganisms = selector({
    key: 'initial-preferred-organisms',
    get: ({ get }) => get(initialOrganismsPreference).organisms,
  });

  const preferredOrganisms = atom({
    key: 'preferred-organisms',
    default: initialPreferredOrganisms,
    effects_UNSTABLE: [
      ({ onSet }) => {
        function onPreferredOrganismsChange(params: string[] | DefaultValue) {
          if (!(params instanceof DefaultValue)) {
            updatePreferredOrganisms(wdkService, params);
          }
        }

        onSet(debounce(onPreferredOrganismsChange, 2000));
      },
    ],
  });

  return {
    availableOrganisms,
    organismTree,
    preferredOrganisms,
    projectId,
  };
}

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
    return pruneNodesWithSingleExtendingChild(orgParam.vocabulary);
  }

  throw new Error(
    TAXON_QUESTION_NAME +
      ' does not contain treebox enum param ' +
      ORGANISM_PARAM_NAME
  );
}

async function fetchPreferredOrganisms(
  wdkService: WdkService,
  availableOrganisms: string[]
) {
  const [buildNumber, userPreferences] = await Promise.all([
    fetchBuildNumber(wdkService),
    wdkService.getCurrentUserPreferences(),
  ]);

  const defaultPreferredOrganisms = {
    buildNumber,
    organisms: availableOrganisms,
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
  newOrganisms: string[]
) {
  const buildNumber = await fetchBuildNumber(wdkService);

  const newOrganismPreference: OrganismPreference = {
    buildNumber,
    organisms: newOrganisms,
  };

  await wdkService.patchScopedUserPreferences(ORGANISM_PREFERENCE_SCOPE, {
    [ORGANISM_PREFERENCE_KEY]: JSON.stringify(newOrganismPreference),
  });
}

async function fetchBuildNumber(wdkService: WdkService) {
  const buildNumberStr = (await wdkService.getConfig()).buildNumber;

  return Number(buildNumberStr);
}

const organismPreference = record({
  buildNumber: number,
  organisms: arrayOf(string),
});

type OrganismPreference = Unpack<typeof organismPreference>;
