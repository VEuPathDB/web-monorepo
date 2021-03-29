import { selector } from 'recoil';

import { WdkService } from '@veupathdb/wdk-client/lib/Core';
import { WdkDependencies } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';

const ALL_ORGANISMS_SEARCH_NAME = 'GenomeDataTypes';
const ORGANISM_NAME_ATTR = 'organism_name';
const IS_REFERENCE_STRAIN_ATTR = 'is_reference_strain';

export function makeReferenceStrainsRecoilState(
  wdkDependencies: WdkDependencies | undefined
) {
  if (wdkDependencies == null) {
    throw new Error(
      'To view Reference Strains, WdkDependendenciesContext must be configured.'
    );
  }

  const { wdkService } = wdkDependencies;

  const referenceStrains = selector({
    key: 'reference-strains',
    get: () => fetchReferenceStrains(wdkService),
  });

  return {
    referenceStrains,
  };
}

async function fetchReferenceStrains(wdkService: WdkService) {
  const organismRecords = await wdkService.getAnswerJson(
    { searchName: ALL_ORGANISMS_SEARCH_NAME, searchConfig: { parameters: {} } },
    { attributes: [ORGANISM_NAME_ATTR, IS_REFERENCE_STRAIN_ATTR] }
  );

  return organismRecords.records.reduce((memo, record) => {
    const {
      [ORGANISM_NAME_ATTR]: organismName,
      [IS_REFERENCE_STRAIN_ATTR]: isReference,
    } = record.attributes;

    if (typeof organismName !== 'string' || typeof isReference !== 'string') {
      throw new Error(
        `To use this feature, each organism record must have string-valued '${ORGANISM_NAME_ATTR}' and '${IS_REFERENCE_STRAIN_ATTR}' attributes.`
      );
    }

    if (isReference === 'yes') {
      memo.add(organismName);
    }

    return memo;
  }, new Set<string>());
}
