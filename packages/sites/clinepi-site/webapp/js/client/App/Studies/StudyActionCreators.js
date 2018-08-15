import { get, identity, mapValues, spread } from 'lodash';
import { emptyAction } from 'wdk-client/ActionCreatorUtils';
import { ok } from 'wdk-client/Json';

export const STUDIES_REQUESTED = 'studies/studies-requested';
export const STUDIES_RECEIVED = 'studies/studies-received';
export const STUDIES_ERROR = 'studies/studies-error'

/**
 * Load studies
 */
export function loadStudies(projectId) {
  return [
    studiesRequested(),
    fetchStudies(projectId)
  ]
}


// Action creators
// ---------------

function studiesRequested() {
  return { type: STUDIES_REQUESTED };
}

function studiesReceived([ studies, invalidRecords ]) {
  return [
    { type: STUDIES_RECEIVED, payload: { studies }},
    invalidRecords.length === 0
      ? emptyAction
      : ({ wdkService }) =>
        wdkService.submitError(new Error('The following studies could not be parsed:\n    '
          + invalidRecords.map(r => JSON.stringify(r.record.id) + ' => ' + r.error).join('\n')))
          .then(() => emptyAction)
  ];
}

function studiesError(error) {
  return { type: STUDIES_ERROR, payload: { error: error.message }};
}


const requiredAttributes = [
  'card_headline',
  'card_points',
  'card_questions',
  'dataset_id',
  'display_name',
  'policy_url',
  'project_availability',
  'study_access',
  'study_categories',
  'bulk_download_url',
];


// Action thunks
// -------------

function fetchStudies(projectId) {
  return ({ wdkService }) => Promise.all([
    projectId,
    wdkService.sendRequest(ok, {
      useCache: 'true',
      cacheId: 'studies',
      method: 'post',
      path: '/answer',
      body: JSON.stringify({
        answerSpec: {
          filters: [],
          parameters: {},
          questionName: 'DatasetQuestions.AllDatasets'
        },
        formatting: {
          format: 'wdk-service-json',
          formatConfig: { requiredAttributes }
        }
      })
    })
  ])
    .then(spread(formatStudies))
    .then(studiesReceived);
}


// Helpers
// -------

const parseStudy = mapProps({
  name: ['attributes.display_name'],
  id: ['attributes.dataset_id'],
  route: ['attributes.dataset_id', id => `/record/dataset/${id}`],
  categories: ['attributes.study_categories', JSON.parse],
  access: ['attributes.study_access'],
  policyUrl: ['attributes.policy_url'],
  downloadUrl: ['attributes.bulk_download_url'],
  projectAvailability: ['attributes.project_availability', JSON.parse],
  headline: ['attributes.card_headline'],
  points: ['attributes.card_points', JSON.parse],
  searches: ['attributes.card_questions', JSON.parse]
})
  

function formatStudies(projectId, answer) {
  const records = answer.records.reduce((records, record) => {

    try {
      const missingAttributes = requiredAttributes.filter(attr => record.attributes[attr] === null);
      if (missingAttributes.length > 0) {
        throw new Error(`Missing data for attributes: ${missingAttributes.join(", ")}.`)
      }
      records.valid.push(parseStudy(record));
      return records;
    }
    catch(error) {
      records.invalid.push({ record, error });
      return records;
    }
  }, { valid: [], invalid: [] });

  return [ records.valid
    .map(study => Object.assign(study, {
      disabled: !study.projectAvailability.includes(projectId),
      searchUrls: mapValues(study.searches, search => `/showQuestion.do?questionFullName=${search}`)
    }))
    .sort((studyA, studyB) =>
      studyA.disabled == studyB.disabled ? 0
      : studyA.disabled ? 1 : -1
    ),
    records.invalid ];
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
    return mapValues(propMap, ([ sourcePath, valueMapper = identity ]) => {
      try {
        return valueMapper(get(source, sourcePath))
      }
      catch(error) {
        throw new Error(`Parsing error at ${sourcePath}: ${error.message}`);
      }
    });
  }
}
