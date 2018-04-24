import { get, identity, mapValues, spread } from 'lodash';
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

function studiesReceived(studies) {
  return { type: STUDIES_RECEIVED, payload: { studies }};
}

function studiesError(error) {
  return { type: STUDIES_ERROR, payload: { error: error.message }};
}


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
          formatConfig: {
            attributes: [
              'card_headline',
              'card_points',
              'card_questions',
              'dataset_id',
              'display_name',
              'policy_url',
              'project_availability',
              'study_access',
              'study_categories',
            ]
          }
        }
      })
    })
  ])
    .then(spread(formatStudies))
    .then(studiesReceived);
}


// Helpers
// -------

function formatStudies(projectId, answer) {
  return answer.records
  // .filter(record => JSON.parse(record.attributes.project_availability).includes(projectId))
    .map(mapProps({
      name: [ 'attributes.display_name' ],
      id: [ 'attributes.dataset_id' ],
      route: [ 'attributes.dataset_id', id => `/record/dataset/${id}` ],
      categories: [ 'attributes.study_categories', JSON.parse ],
      access: [ 'attributes.study_access' ],
      policyUrl: [ 'attributes.policy_url' ],
      projectAvailability: [ 'attributes.project_availability', JSON.parse ],
      headline: [ 'attributes.card_headline' ],
      points: [ 'attributes.card_points', JSON.parse ],
      searches: [ 'attributes.card_questions', JSON.parse ]
    }))
    .map(study => Object.assign(study, {
      disabled: !study.projectAvailability.includes(projectId),
      searchUrls: mapValues(study.searches, search => `/showQuestion.do?questionFullName=${search}`)
    }))
    .sort((studyA, studyB) =>
      studyA.disabled == studyB.disabled ? 0
      : studyA.disabled ? 1 : -1
    );
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
    return mapValues(propMap, ([ sourcePath, valueMapper = identity ]) =>
      valueMapper(get(source, sourcePath)));
  }
}
