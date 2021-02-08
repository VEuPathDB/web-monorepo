import { invert } from 'lodash';

import { WdkService } from '@veupathdb/wdk-client/lib/Core';

const ORGANISMS_URL_SEGMENT = 'GenomeDataTypes';

const ORGANISM_NAME_ATTRIBUTE_NAME = 'organism_name';
const NAME_FOR_FILENAMES_ATTRIBUTE_NAME = 'name_for_filenames';

export async function fetchOrganismToFilenameMaps(wdkService: WdkService) {
  const answer = await wdkService.getAnswerJson(
    {
      searchName: ORGANISMS_URL_SEGMENT,
      searchConfig: {
        parameters: {},
      },
    },
    {
      attributes: [
        ORGANISM_NAME_ATTRIBUTE_NAME,
        NAME_FOR_FILENAMES_ATTRIBUTE_NAME,
      ],
    }
  );

  const organismsToFiles = answer.records.reduce((memo, { attributes }) => {
    const organismName = attributes[ORGANISM_NAME_ATTRIBUTE_NAME];
    const nameForFileNames = attributes[NAME_FOR_FILENAMES_ATTRIBUTE_NAME];

    if (typeof organismName !== 'string') {
      throw new Error(
        `The '${ORGANISM_NAME_ATTRIBUTE_NAME}' attribute should be a string`
      );
    }

    if (typeof nameForFileNames !== 'string') {
      throw new Error(
        `The '${NAME_FOR_FILENAMES_ATTRIBUTE_NAME}' attribute should be a string`
      );
    }

    memo[organismName] = nameForFileNames;

    return memo;
  }, {} as Record<string, string>);

  return {
    filesToOrganisms: invert(organismsToFiles),
    organismsToFiles,
  };
}
