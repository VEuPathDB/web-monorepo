import { selector } from 'recoil';

import { memoize } from 'lodash';

import { WdkDependencies } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { ok } from '@veupathdb/wdk-client/lib/Utils/Json';
import {
  Question,
  RecordInstance,
  StandardReportConfig,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';

const ALL_DATASETS_SEARCH_NAME = 'AllDatasets';
const DATASET_ID_ATTRIBUTE = 'dataset_id';
const ORGANISMS_TABLE = 'Version';
const ORGANISM_ATTRIBUTE = 'organism';
const WDK_REFERENCES_TABLE = 'References';
const TARGET_TYPE_ATTRIBUTE = 'target_type';
const TARGET_NAME_ATTRIBUTE = 'target_name';
const LINK_TYPE_ATTRIBUTE = 'link_type';
const URL_ATTRBUTE = 'url';

export const makeDatasetMetadataRecoilState = memoize(
  (wdkDependencies: WdkDependencies | undefined) => {
    if (wdkDependencies == null) {
      throw new Error(
        'To use this feature, WdkDependenciesContext must be configured.'
      );
    }

    const { wdkService } = wdkDependencies;

    const questions$: Promise<Question[]> = wdkService
      .getQuestions()
      .catch((e) => wdkService.submitError(e).then((_) => []));

    const questions = selector({
      key: 'questions',
      get: () => questions$,
    });

    const reportConfig: StandardReportConfig = {
      attributes: [DATASET_ID_ATTRIBUTE],
      bufferEntireResponse: true,
      tables: [ORGANISMS_TABLE, WDK_REFERENCES_TABLE],
    };
    // FIXME: Add an "answer" decoder to WDKClient to make this
    // request type-safe
    const datasetRecords$: Promise<RecordInstance[]> = wdkService
      .sendRequest(ok, {
        useCache: true,
        cacheId: 'org-prefs-dataset-metadata',
        method: 'post',
        path: wdkService.getStandardSearchReportEndpoint(
          'dataset',
          ALL_DATASETS_SEARCH_NAME
        ),
        body: JSON.stringify({
          searchConfig: { parameters: {} },
          reportConfig,
        }),
      })
      .then((answer) => answer.records)
      .catch((e) => wdkService.submitError(e).then((_) => []));

    const datasetRecords = selector({
      key: 'dataset-records',
      get: () => datasetRecords$,
    });

    const datasetMetadata = selector({
      key: 'dataset-metadata',
      get: ({ get }) =>
        findDatasetMetadata(get(datasetRecords), get(questions)),
    });

    return {
      datasetMetadata,
      datasetRecords,
      questions,
    };
  }
);

export interface DatasetMetadata {
  organisms: string[];
  questions: string[]; // Expressed via the url segment of the question
}

function findDatasetMetadata(
  datasetRecords: RecordInstance[],
  questions: Question[]
) {
  const questionNameMap = questions.reduce((memo, question) => {
    return memo.set(question.fullName, question.urlSegment);
  }, new Map<string, string>());

  return datasetRecords.reduce((memo, record) => {
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

    if (wdkReferencesTable == null) {
      throw new Error(
        `In order to use this feature, each dataset record must have a '${WDK_REFERENCES_TABLE}' tables.`
      );
    }

    const organisms =
      organismsTable == null
        ? ['ALL']
        : organismsTable.reduce((memo, { [ORGANISM_ATTRIBUTE]: organism }) => {
            if (typeof organism !== 'string') {
              throw new Error(
                `In order to use this feature, each row of the '${ORGANISMS_TABLE}' table must have a string-valued '${ORGANISM_ATTRIBUTE}' attribute.`
              );
            }

            memo.push(organism);

            return memo;
          }, [] as string[]);

    const questions = wdkReferencesTable.reduce(
      (
        memo,
        {
          [TARGET_NAME_ATTRIBUTE]: targetName,
          [TARGET_TYPE_ATTRIBUTE]: targetType,
          [LINK_TYPE_ATTRIBUTE]: linkType,
          [URL_ATTRBUTE]: url,
        }
      ) => {
        if (targetType === 'question') {
          const questionFullName = targetName;

          if (typeof questionFullName !== 'string') {
            console.warn(
              `Observed a non-string question target '${questionFullName}' for dataset '${datasetId}'`
            );
            return memo;
          }

          const questionUrlSegment = questionNameMap.get(questionFullName);

          if (questionUrlSegment == null) {
            console.warn(
              `Observed a non-existent question '${questionFullName}' for dataset '${datasetId}'`
            );
            return memo;
          }

          memo.push(questionUrlSegment);
        }

        if (linkType === 'genomicsInternal') {
          if (typeof url !== 'string') {
            console.warn(
              `Observed a non-string url '${url}' for dataset '${datasetId}'`
            );

            return memo;
          }

          if (!url.startsWith('/a/app/search')) {
            return memo;
          }

          const questionUrlSegment = url.replace(/^.*\//, '');

          memo.push(questionUrlSegment);
        }

        return memo;
      },
      [] as string[]
    );

    return memo.set(datasetId, { organisms, questions });
  }, new Map<string, DatasetMetadata>());
}
