import { WdkService } from '@veupathdb/wdk-client/lib/Core';
import {
  Unpack,
  arrayOf,
  decodeOrElse,
  number,
  record,
  string,
} from '@veupathdb/wdk-client/lib/Utils/Json';
import { pruneNodesWithSingleExtendingChild } from '@veupathdb/web-common/lib/util/organisms';

export const ORGANISM_PREFERENCE_KEY = 'organism_preference';
export const ORGANISM_PREFERENCE_SCOPE = 'project';

// FIXME: DRY this up by porting to @veupathdb/web-common
// TODO Make these configurable via model.prop, and when not defined, always return an empty tree.
// This way non-genomic sites can call this without effect, while keeping the thrown error if
// the configuered search/param are not available.
const TAXON_QUESTION_NAME = 'SequencesByTaxon';
const ORGANISM_PARAM_NAME = 'organism';

export async function fetchOrganismTree(wdkService: WdkService) {
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

export async function fetchPreferredOrganisms(
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

export async function updatePreferredOrganisms(
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

export const organismPreference = record({
  buildNumber: number,
  organisms: arrayOf(string),
});

export type OrganismPreference = Unpack<typeof organismPreference>;
