import { selector } from 'recoil';

import { memoize } from 'lodash';

import { WdkService } from '@veupathdb/wdk-client/lib/Core';
import { WdkDependencies } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';

const ALL_ORGANISMS_SEARCH_NAME = 'GenomeDataTypes';
const ORGANISM_NAME_ATTR = 'organism_name';
const BUILD_INTRODUCED_ATTR = 'build_introduced';
const IS_REFERENCE_STRAIN_ATTR = 'is_reference_strain';

export const makeOrganismMetadataRecoilState = memoize(
  (wdkDependencies: WdkDependencies | undefined) => {
    if (wdkDependencies == null) {
      throw new Error(
        'To use this feature, WdkDependenciesContext must be configured.'
      );
    }

    const { wdkService } = wdkDependencies;

    const organismMetadata = selector({
      key: 'organism-metadata',
      get: () => fetchOrganismMetadata(wdkService),
    });

    return {
      organismMetadata,
    };
  }
);

export interface OrganismMetadata {
  buildIntroduced: number;
  isReference: boolean;
}

async function fetchOrganismMetadata(wdkService: WdkService) {
  try {
    const organismRecords = await wdkService.getAnswerJson(
      {
        searchName: ALL_ORGANISMS_SEARCH_NAME,
        searchConfig: { parameters: {} },
      },
      {
        attributes: [
          ORGANISM_NAME_ATTR,
          BUILD_INTRODUCED_ATTR,
          IS_REFERENCE_STRAIN_ATTR,
        ],
      }
    );

    return organismRecords.records.reduce((memo, record) => {
      const {
        [ORGANISM_NAME_ATTR]: organismName,
        [BUILD_INTRODUCED_ATTR]: buildIntroduced,
        [IS_REFERENCE_STRAIN_ATTR]: isReference,
      } = record.attributes;

      if (
        typeof organismName !== 'string' ||
        typeof buildIntroduced !== 'string' ||
        typeof isReference !== 'string'
      ) {
        throw new Error(
          `To use this feature, each organism record must have string-valued '${ORGANISM_NAME_ATTR}', '${BUILD_INTRODUCED_ATTR}' , and'${IS_REFERENCE_STRAIN_ATTR}' attributes.`
        );
      }

      return memo.set(organismName, {
        buildIntroduced: Number(buildIntroduced),
        isReference: isReference === 'yes',
      });
    }, new Map<string, OrganismMetadata>());
  } catch {
    return new Map<string, OrganismMetadata>();
  }
}
