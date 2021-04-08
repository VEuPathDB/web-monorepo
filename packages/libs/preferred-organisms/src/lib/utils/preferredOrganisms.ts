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

export const ALL_DATASETS_SEARCH_NAME = 'AllDatasets';
export const BUILD_NUMBER_INTRODUCED_ATTRIBUTE = 'build_number_introduced';
export const ORGANISMS_TABLE = 'Version';
export const ORGANISM_TERM_ATTRIBUTE = 'organism';

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

  const buildNumber = selector({
    key: 'build-number',
    get: ({ get }) => {
      const buildNumberStr = get(config).buildNumber;

      return Number(buildNumberStr);
    },
  });

  const organismTree = selector({
    key: 'organism-tree',
    get: () => fetchOrganismTree(wdkService),
  });

  const organismBuildNumbers = selector({
    key: 'organism-build-numbers',
    get: () => fetchOrganismBuildNumbers(wdkService),
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
          debounce(onPreferredOrganismsChange, 200, {
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
        get(organismBuildNumbers),
        get(organismPreferenceBuildNumber)
      ),
  });

  return {
    availableOrganisms,
    buildNumber,
    newOrganisms,
    organismBuildNumbers,
    organismPreference,
    organismPreferenceBuildNumber,
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

async function fetchOrganismBuildNumbers(wdkService: WdkService) {
  const datasetRecords = await wdkService.getAnswerJson(
    {
      searchName: ALL_DATASETS_SEARCH_NAME,
      searchConfig: { parameters: {} },
    },
    {
      tables: [ORGANISMS_TABLE],
      attributes: [BUILD_NUMBER_INTRODUCED_ATTRIBUTE],
    }
  );

  return datasetRecords.records.reduce((memo, record) => {
    const buildNumberIntroducedAttribute =
      record.attributes[BUILD_NUMBER_INTRODUCED_ATTRIBUTE];

    if (typeof buildNumberIntroducedAttribute !== 'string') {
      throw new Error(
        `To use this feature, each dataset record must have a string-valued '${BUILD_NUMBER_INTRODUCED_ATTRIBUTE}'`
      );
    }

    const datasetBuildNumber = Number(buildNumberIntroducedAttribute);

    const organismsTable = record.tables[ORGANISMS_TABLE];

    return organismsTable.reduce(
      (nestedMemo, { [ORGANISM_TERM_ATTRIBUTE]: organismTermAttribute }) => {
        if (typeof organismTermAttribute !== 'string') {
          throw new Error(
            `To use this feature, each row of the '${ORGANISMS_TABLE}' table must have a string-valued '${ORGANISM_TERM_ATTRIBUTE}'`
          );
        }

        const organismBuildNumber = nestedMemo.get(organismTermAttribute);

        return nestedMemo.set(
          organismTermAttribute,
          Math.min(organismBuildNumber ?? Infinity, datasetBuildNumber)
        );
      },
      memo
    );
  }, new Map<string, number>());
}

function findNewOrganisms(
  availableOrganisms: string[],
  organismBuildNumbers: Map<string, number>,
  organismPreferenceBuildNumber: number
) {
  const availableOrganismSet = new Set(availableOrganisms);

  return [...organismBuildNumbers].reduce((memo, [organism, buildNumber]) => {
    if (
      availableOrganismSet.has(organism) &&
      buildNumber > organismPreferenceBuildNumber
    ) {
      memo.add(organism);
    }

    return memo;
  }, new Set<string>());
}

const organismPreference = record({
  buildNumber: number,
  organisms: arrayOf(string),
});

type OrganismPreference = Unpack<typeof organismPreference>;
