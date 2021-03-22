import { WdkService } from '@veupathdb/wdk-client/lib/Core';
import {
  Unpack,
  arrayOf,
  decodeOrElse,
  number,
  record,
  string,
} from '@veupathdb/wdk-client/lib/Utils/Json';
import { Node } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { TreeBoxVocabNode } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

import { makeInitialConfigSelection } from './configTrees';

export const PERSISTENCE_KEY = 'organism_preference';
export const PREFERENCE_SCOPE = 'project';

export async function fetchPreferredOrganisms(
  wdkService: WdkService,
  organismTree: Node<TreeBoxVocabNode>
) {
  const [buildNumber, userPreferences] = await Promise.all([
    fetchBuildNumber(wdkService),
    wdkService.getCurrentUserPreferences(),
  ]);

  const defaultPreferredOrganisms = {
    buildNumber,
    organisms: makeInitialConfigSelection(organismTree),
  };

  const preferenceStr =
    userPreferences[PREFERENCE_SCOPE][PERSISTENCE_KEY] ?? '';

  return decodeOrElse(
    organismPreference,
    defaultPreferredOrganisms,
    preferenceStr
  );
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
