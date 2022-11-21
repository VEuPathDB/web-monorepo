import { get, identity, keyBy, mapValues, orderBy, spread } from 'lodash';
import { emptyAction } from '@veupathdb/wdk-client/lib/Core/WdkMiddleware';

import { getSearchableString } from '@veupathdb/wdk-client/lib/Views/Records/RecordUtils'

import { showUnreleasedData } from 'ebrc-client/config';
import { isDiyWdkRecordId } from 'ebrc-client/util/diyDatasets';

export const STUDIES_REQUESTED = 'studies/studies-requested';
export const STUDIES_RECEIVED = 'studies/studies-received';
export const STUDIES_ERROR = 'studies/studies-error';

/**
 * Load studies
 */
export function requestStudies() {
  return [
    studiesRequested(),
    loadStudies()
  ]
}


// Action creators
// ---------------

function studiesRequested() {
  return { type: STUDIES_REQUESTED };
}

function studiesReceived([studies, invalidRecords]) {
  return [
    { type: STUDIES_RECEIVED, payload: { studies } },
    invalidRecords.length === 0
      ? emptyAction
      : ({ wdkService }) =>
        wdkService.submitError(new Error('The following studies could not be parsed:\n    '
          + invalidRecords.map(r => JSON.stringify(r.record.id) + ' => ' + r.error).join('\n')))
          .then(() => emptyAction)
  ];
}

function studiesError(error) {
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
  return function run({ wdkService }) {
    return fetchStudies(wdkService)
      .then(studiesReceived, studiesError);
  }
}


export function fetchStudies(wdkService) {
  return Promise.all([
    wdkService.getQuestions(),
    wdkService.getRecordClasses(),
    wdkService.getStudies('__ALL_ATTRIBUTES__', '__ALL_TABLES__')
  ]).then(spread(formatStudies))
}


// Helpers
//

const parseStudy = mapProps({
  name: ['attributes.display_name'],
  id: ['attributes.dataset_id'],
  route: ['attributes.dataset_id', id => `/record/dataset/${id}`],
  categories: [record => 'disease' in record.attributes
    ? (record.attributes.disease || 'Unknown').split(/,\s*/g)
    : JSON.parse(record.attributes.study_categories)],
  // TODO Remove .toLowerCase() when attribute display value is updated
  access: ['attributes.study_access', access => access && access.toLowerCase()],
  isReleased: ['attributes.is_public', str => str === 'true'],
  email: ['attributes.email'],
  policyUrl: ['attributes.policy_url'],
  requestNeedsApproval: ['attributes.request_needs_approval'],
  downloadUrl: ['attributes.bulk_download_url'],
  headline: ['attributes.card_headline'],
  points: ['attributes.card_points', JSON.parse],
  searches: ['attributes.card_questions', JSON.parse]
});

function formatStudies(questions, recordClasses, answer) {
  const questionsByName = keyBy(questions, 'fullName');
  const recordClassesByName = keyBy(recordClasses, 'urlSegment');

  const records = answer.records.reduce((records, record) => {

    try {
      const missingAttributes = requiredAttributes.filter(attr => record.attributes[attr] == null);
      if (missingAttributes.length > 0) {
        throw new Error(`Missing data for attributes: ${missingAttributes.join(", ")}.`)
      }
      records.valid.push({
        ...parseStudy(record),
        searchString: getSearchableString(
          [],
          [],
          record
        )
      });

      // Our presenters use a build number of 0 to convey studies
      // which should appear first...
      // (1) in the cards and...
      // (2) in the "Search a study" menu
      if (record.attributes.build_number_introduced === '0') {
        records.appearFirst.add(record.attributes.dataset_id);
      }

      return records;
    }

    catch (error) {
      records.invalid.push({ record, error });
      return records;
    }

  }, { valid: [], invalid: [], appearFirst: new Set() });

  const validRecords = records.valid
    // remove unreleased studies, unless `showUnreleasedData = true`
    // also, remove DIY studies
    .filter(
      study =>
        (study.isReleased || showUnreleasedData) &&
        !isDiyWdkRecordId(study.id)
    )
    .map(study => Object.assign(study, {
      disabled: false,
      searches: Object.values(study.searches)
        .map(questionName => questionsByName[questionName])
        .filter(question => question != null)
        .map(question => {
          const recordClass = recordClassesByName[question.outputRecordClassName];
          return {
            icon: question.iconName || recordClass.iconName || 'fa fa-database',
            name: question.fullName,
            path: `${recordClass.urlSegment}/${question.urlSegment}`,
            displayName: recordClass.shortDisplayNamePlural,
          };
        })
    }));

  return [validRecords, records.invalid];
}

/**
 *  Map props from source object to props in new object.
 *
 * @param {object} propMap Object describing how to map properties. Keys are
 * key for new object, and values are an array of [ path, valueMapper ], where
 * valueMapper is a function that takes the value from the source object and
 * returns a new value. If valueMapper is not specified, then identity is used.
 */
function mapProps(propMap) {
  return function mapper(source) {
    return mapValues(propMap, ([sourcePath, valueMapper = identity]) => {
      try {
        if (typeof sourcePath === 'function') return valueMapper(sourcePath(source));
        return valueMapper(get(source, sourcePath))
      }
      catch (error) {
        throw new Error(`Parsing error at ${sourcePath}: ${error.message}`);
      }
    });
  }
}
