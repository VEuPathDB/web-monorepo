import { selector } from 'recoil';

import { memoize } from 'lodash';

import { WdkService } from '@veupathdb/wdk-client/lib/Core';
import { WdkDependencies } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';

const ALL_DATASETS_SEARCH_NAME = 'AllDatasets';
const DATASET_ID_ATTRIBUTE = 'dataset_id';
const ORGANISMS_TABLE = 'Version';
const ORGANISM_ATTRIBUTE = 'organism';
const WDK_REFERENCES_TABLE = 'References';
const TARGET_TYPE_ATTRIBUTE = 'target_type';
const TARGET_NAME_ATTRIBUTE = 'target_name';

export const makeDatasetMetadataRecoilState = memoize(
  (wdkDependencies: WdkDependencies | undefined) => {
    if (wdkDependencies == null) {
      throw new Error(
        'To use this feature, WdkDependenciesContext must be configured.'
      );
    }

    const { wdkService } = wdkDependencies;

    const datasetMetadata = selector({
      key: 'dataset-metadata',
      get: () => fetchDatasetMetadata(wdkService),
    });

    return {
      datasetMetadata,
    };
  }
);

export interface DatasetMetadata {
  organisms: string[];
  questions: string[]; // Expressed via the url segment of the question
}

async function fetchDatasetMetadata(wdkService: WdkService) {
  try {
    const [datasetRecords, questions] = await Promise.all([
      wdkService.getAnswerJson(
        {
          searchName: ALL_DATASETS_SEARCH_NAME,
          searchConfig: { parameters: {} },
        },
        {
          attributes: [DATASET_ID_ATTRIBUTE],
          tables: [ORGANISMS_TABLE, WDK_REFERENCES_TABLE],
        }
      ),
      wdkService.getQuestions(),
    ]);

    const questionNameMap = questions.reduce((memo, question) => {
      return memo.set(question.fullName, question.urlSegment);
    }, new Map<string, string>());

    return datasetRecords.records.reduce((memo, record) => {
      const { [DATASET_ID_ATTRIBUTE]: datasetId } = record.attributes;

      const {
        [ORGANISMS_TABLE]: organismsTable,
        [WDK_REFERENCES_TABLE]: wdkReferencesTable,
      } = record.tables;

      if (typeof datasetId !== 'string') {
        throw new Error(
          `In order to use this feature, each dataset record must have a string-valued '${DATASET_ID_ATTRIBUTE}' attribute.`
        );
      }

      if (organismsTable == null || wdkReferencesTable == null) {
        throw new Error(
          `In order to use this feature, each dataset record must have '${ORGANISMS_TABLE}' and '${WDK_REFERENCES_TABLE}' tables.`
        );
      }

      const organisms = organismsTable.reduce(
        (memo, { [ORGANISM_ATTRIBUTE]: organism }) => {
          if (typeof organism !== 'string') {
            throw new Error(
              `In order to use this feature, each row of the '${ORGANISMS_TABLE}' table must have a string-valued '${ORGANISM_ATTRIBUTE}' attribute.`
            );
          }

          memo.push(organism);

          return memo;
        },
        [] as string[]
      );

      const questions = wdkReferencesTable.reduce(
        (
          memo,
          {
            [TARGET_NAME_ATTRIBUTE]: targetName,
            [TARGET_TYPE_ATTRIBUTE]: targetType,
          }
        ) => {
          if (
            typeof targetName !== 'string' ||
            typeof targetType !== 'string'
          ) {
            throw new Error(
              `In order to use this feature, each row of the '${WDK_REFERENCES_TABLE}' table must have string-valued '${TARGET_TYPE_ATTRIBUTE}' and '${TARGET_NAME_ATTRIBUTE}' attributes.`
            );
          }

          if (targetType === 'question') {
            const questionFullName = targetName;
            const questionUrlSegment = questionNameMap.get(questionFullName);

            if (questionUrlSegment == null) {
              console.warn(
                `Observed a WDK Reference for a non-existent question '${questionFullName}'`
              );
              return memo;
            }

            memo.push(questionUrlSegment);
          }

          return memo;
        },
        [] as string[]
      );

      return memo.set(datasetId, { organisms, questions });
    }, new Map<string, DatasetMetadata>());
  } catch {
    return new Map<string, DatasetMetadata>();
  }
}
