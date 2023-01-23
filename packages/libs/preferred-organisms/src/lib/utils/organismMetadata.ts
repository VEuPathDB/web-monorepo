import { selector } from 'recoil';

import { memoize } from 'lodash';

import { WdkService } from '@veupathdb/wdk-client/lib/Core';
import { WdkDependencies } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { ok } from '@veupathdb/wdk-client/lib/Utils/Json';
import { Answer } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

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

    const organismMetadata$ = fetchOrganismMetadata(wdkService);

    const organismMetadata = selector({
      key: 'organism-metadata',
      get: () => organismMetadata$,
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
    // FIXME: Add an "answer" decoder to WDKClient to make this
    // request type-safe
    const organismRecords: Answer = await wdkService.sendRequest(ok, {
      useCache: true,
      cacheId: 'org-prefs-organism-metadata',
      method: 'post',
      path: wdkService.getStandardSearchReportEndpoint(
        'organism',
        ALL_ORGANISMS_SEARCH_NAME
      ),
      body: JSON.stringify({
        searchConfig: { parameters: {} },
        reportConfig: {
          attributes: [
            ORGANISM_NAME_ATTR,
            BUILD_INTRODUCED_ATTR,
            IS_REFERENCE_STRAIN_ATTR,
          ],
          bufferEntireResponse: true,
        },
      }),
    });

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
