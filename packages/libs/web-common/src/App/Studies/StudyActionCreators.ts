import { get, identity, keyBy, mapValues, spread } from 'lodash';
import { emptyAction } from '@veupathdb/wdk-client/lib/Core/WdkMiddleware';

import { getSearchableString } from '@veupathdb/wdk-client/lib/Views/Records/RecordUtils';

import { showUnreleasedData } from '../../config';
import { isDiyWdkRecordId } from '@veupathdb/user-datasets/lib/Utils/diyDatasets';
import WdkService from '@veupathdb/wdk-client/lib/Service/WdkService';
import {
  Question,
  RecordClass,
  RecordInstance,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';

export const STUDIES_REQUESTED = 'studies/studies-requested';
export const STUDIES_RECEIVED = 'studies/studies-received';
export const STUDIES_ERROR = 'studies/studies-error';

export interface StudySearch {
  icon: string;
  name: string;
  path: string;
  displayName: string;
}

export interface Study {
  name: string;
  id: string;
  route: string;
  categories: string[];
  access: string;
  isReleased: boolean;
  email?: string;
  policyUrl?: string;
  requestNeedsApproval?: string;
  downloadUrl?: string;
  headline?: string;
  points?: string[];
  searches: StudySearch[];
  searchString: string;
  disabled: boolean;
}

interface InvalidRecord {
  record: RecordInstance;
  error: Error;
}

export type StudiesRequestedAction = {
  type: typeof STUDIES_REQUESTED;
};

export type StudiesReceivedAction = {
  type: typeof STUDIES_RECEIVED;
  payload: { studies: Study[] };
};

export type StudiesErrorAction = {
  type: typeof STUDIES_ERROR;
  payload: { error: string };
};

export type StudiesAction =
  | StudiesRequestedAction
  | StudiesReceivedAction
  | StudiesErrorAction;

/**
 * Load studies
 */
export function requestStudies() {
  return [studiesRequested(), loadStudies()];
}

// Action creators
// ---------------

function studiesRequested(): StudiesRequestedAction {
  return { type: STUDIES_REQUESTED };
}

function studiesReceived([studies, invalidRecords]: [Study[], InvalidRecord[]]) {
  return [
    { type: STUDIES_RECEIVED, payload: { studies } },
    invalidRecords.length === 0
      ? emptyAction
      : ({ wdkService }: { wdkService: WdkService }) =>
          wdkService
            .submitError(
              new Error(
                'The following studies could not be parsed:\n    ' +
                  invalidRecords
                    .map((r) => JSON.stringify(r.record.id) + ' => ' + r.error)
                    .join('\n')
              )
            )
            .then(() => emptyAction),
  ];
}

function studiesError(error: Error): StudiesErrorAction {
  return { type: STUDIES_ERROR, payload: { error: error.message } };
}

const requiredAttributes = [
  'card_headline',
  'card_points',
  'card_questions',
  'dataset_id',
  'display_name',
  'is_public',
  'study_access',
  'bulk_download_url',
];

// Action thunks
// -------------

function loadStudies() {
  return function run({ wdkService }: { wdkService: WdkService }) {
    return fetchStudies(wdkService).then(studiesReceived, studiesError);
  };
}

export function fetchStudies(
  wdkService: WdkService
): Promise<[Study[], InvalidRecord[]]> {
  return Promise.all([
    wdkService.getQuestions(),
    wdkService.getRecordClasses(),
    wdkService.getStudies('__ALL_ATTRIBUTES__', '__ALL_TABLES__'),
  ]).then(spread(formatStudies));
}

// Helpers
//

type PropMapper<T> = {
  [K in keyof T]: [
    string | ((record: RecordInstance) => any),
    ((value: any) => T[K])?,
  ];
};

interface ParsedStudy {
  name: string;
  id: string;
  route: string;
  categories: string[];
  access: string;
  isReleased: boolean;
  email?: string;
  policyUrl?: string;
  requestNeedsApproval?: string;
  downloadUrl?: string;
  headline?: string;
  points?: string[];
  searches: Record<string, string>;
}

const parseStudy = mapProps<ParsedStudy>({
  name: ['attributes.display_name'],
  id: ['attributes.dataset_id'],
  route: ['attributes.dataset_id', (id: string) => `/record/dataset/${id}`],
  categories: [
    (record: RecordInstance) =>
      'disease' in record.attributes
        ? (record.attributes.disease || 'Unknown').split(/,\s*/g)
        : JSON.parse(record.attributes.study_categories as string),
  ],
  // TODO Remove .toLowerCase() when attribute display value is updated
  access: [
    'attributes.study_access',
    (access: string) => access && access.toLowerCase(),
  ],
  isReleased: ['attributes.is_public', (str: string) => str === 'true'],
  email: ['attributes.email'],
  policyUrl: ['attributes.policy_url'],
  requestNeedsApproval: ['attributes.request_needs_approval'],
  downloadUrl: ['attributes.bulk_download_url'],
  headline: ['attributes.card_headline'],
  points: ['attributes.card_points', JSON.parse],
  searches: ['attributes.card_questions', JSON.parse],
});

function formatStudies(
  questions: Question[],
  recordClasses: RecordClass[],
  answer: { records: RecordInstance[] }
): [Study[], InvalidRecord[]] {
  const questionsByName: Record<string, Question> = keyBy(
    questions,
    'fullName'
  );
  const recordClassesByName: Record<string, RecordClass> = keyBy(
    recordClasses,
    'urlSegment'
  );

  const records = answer.records.reduce<{
    valid: Study[];
    invalid: InvalidRecord[];
    appearFirst: Set<string>;
  }>(
    (records, record) => {
      try {
        const missingAttributes = requiredAttributes.filter(
          (attr) => record.attributes[attr] == null
        );
        if (missingAttributes.length > 0) {
          throw new Error(
            `Missing data for attributes: ${missingAttributes.join(', ')}.`
          );
        }
        records.valid.push({
          ...parseStudy(record),
          searchString: getSearchableString([], [], record),
        } as Study);

        // Our presenters use a build number of 0 to convey studies
        // which should appear first...
        // (1) in the cards and...
        // (2) in the "Search a study" menu
        if (record.attributes.build_number_introduced === '0') {
          records.appearFirst.add(record.attributes.dataset_id as string);
        }

        return records;
      } catch (error) {
        records.invalid.push({ record, error: error as Error });
        return records;
      }
    },
    { valid: [], invalid: [], appearFirst: new Set() }
  );

  const validRecords = records.valid
    // remove unreleased studies, unless `showUnreleasedData = true`
    // also, remove DIY studies
    .filter(
      (study) =>
        (study.isReleased || showUnreleasedData) && !isDiyWdkRecordId(study.id)
    )
    .map((study) =>
      Object.assign(study, {
        disabled: false,
        searches: Object.values(study.searches)
          .map((questionName) => questionsByName[questionName])
          .filter((question) => question != null)
          .map((question): StudySearch => {
            const recordClass =
              recordClassesByName[question.outputRecordClassName];
            return {
              icon:
                question.iconName || recordClass.iconName || 'fa fa-database',
              name: question.fullName,
              path: `${recordClass.urlSegment}/${question.urlSegment}`,
              displayName: recordClass.shortDisplayNamePlural,
            };
          }),
      })
    );

  return [validRecords, records.invalid];
}

/**
 *  Map props from source object to props in new object.
 *
 * @param propMap Object describing how to map properties. Keys are
 * key for new object, and values are an array of [ path, valueMapper ], where
 * valueMapper is a function that takes the value from the source object and
 * returns a new value. If valueMapper is not specified, then identity is used.
 */
function mapProps<T>(propMap: PropMapper<T>) {
  return function mapper(source: RecordInstance): T {
    return mapValues(
      propMap,
      ([sourcePath, valueMapper = identity]: [
        string | ((record: RecordInstance) => any),
        ((value: any) => any)?,
      ]) => {
        try {
          if (typeof sourcePath === 'function')
            return valueMapper(sourcePath(source));
          return valueMapper(get(source, sourcePath));
        } catch (error) {
          throw new Error(
            `Parsing error at ${sourcePath}: ${(error as Error).message}`
          );
        }
      }
    ) as T;
  };
}
