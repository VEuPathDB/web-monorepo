import { combineEpics } from 'redux-observable';
import { ResultTableSummaryViewActions } from 'wdk-client/Actions';
import { makeActionCreator, mergeMapRequestActionsToEpic as mrate } from 'wdk-client/ActionCreatorUtils';

export const REPRESENTATIVE_TRANSCRIPT_FILTER_NAME = 'representativeTranscriptOnly';
export const TRANSCRIPT_RECORD_CLASS_NAME = 'TranscriptRecordClasses.TranscriptRecordClass';
export const TRANSCRIPT_LINK_ATTRIBUTE_NAME = 'transcript_link';

export const wdkServiceMixin = WdkService => class TranscriptMixin extends WdkService {

  async getStepAnswer(stepId, formatting, userId = 'current') {
    const step = await this.findStep(stepId, userId);
    return this.getAnswer(step.answerSpec, formatting);
  }

  async getStepAnswerJson(stepId, formatConfig, userId = 'current') {
    const step = await this.findStep(stepId, userId);
    return this.getAnswerJson(step.answerSpec, formatConfig);
  }

  async getAnswer(answerSpec, formatting) {
    return super.getAnswer(await this._updateAnswerSpecIfTranscript(answerSpec), formatting);
  }

  async getAnswerJson(answerSpec, formatConfig) {
    return super.getAnswerJson(
      await this._updateAnswerSpecIfTranscript(answerSpec),
      // We only need to do this for answerJson
      await this._ensureTranscriptLinkAttribute(answerSpec, formatConfig)
    );
  }

  async updateRepresentativeTranscriptFilter(shouldEnable) {
    return this.patchUserPreference(
      'project',
      REPRESENTATIVE_TRANSCRIPT_FILTER_NAME,
      shouldEnable ? 'true' : 'false'
    )
  }

  async _updateAnswerSpecIfTranscript(answerSpec) {
    if (!this._isTranscriptQuestion(answerSpec)) return answerSpec;
    const prefs = await this.getCurrentUserPreferences();
    const shouldAddFilter = prefs.project[REPRESENTATIVE_TRANSCRIPT_FILTER_NAME] === 'true';
    const viewFiltersWithoutTranscriptFilter = answerSpec.viewFilters
      ? answerSpec.viewFilters.filter(({ name }) => name !== REPRESENTATIVE_TRANSCRIPT_FILTER_NAME)
      : undefined;
    const viewFilters = shouldAddFilter
      ? [ ...viewFiltersWithoutTranscriptFilter, { name: REPRESENTATIVE_TRANSCRIPT_FILTER_NAME, value: {} }]
      : undefined;
    return { ...answerSpec, viewFilters };
  }

  async _ensureTranscriptLinkAttribute(answerSpec, formatConfig) {
    if (
      !(await this._isTranscriptQuestion(answerSpec)) ||
      formatConfig.attributes == null ||
      formatConfig.attributes[1] === TRANSCRIPT_LINK_ATTRIBUTE_NAME
    ) return formatConfig;

    // make sure formatConfig includes transcript_link as the second attribute
    const attributes = formatConfig.attributes.filter(a => a !== TRANSCRIPT_LINK_ATTRIBUTE_NAME);
    attributes.splice(1, 0, TRANSCRIPT_LINK_ATTRIBUTE_NAME);
    return { ...formatConfig, attributes };
  }

  async _isTranscriptQuestion(answerSpec) {
    const question = await this.findQuestion(({ name }) => name === answerSpec.questionName);
    return question.recordClassName === TRANSCRIPT_RECORD_CLASS_NAME;
  }

}


export const requestTranscriptFilterPreference = makeActionCreator(
  'transcript/requestTranscriptFilterPreference'
)

export const fulfillTranscriptFilterPreference = makeActionCreator(
  'transcript/fulfillTranscriptFilterPreference',
  isEnabled => ({ isEnabled })
)

export const requestTranscriptFilterUpdate = makeActionCreator(
  'transcript/requestTranscriptFilterUpdate',
  shouldEnable => ({ shouldEnable })
)

export const fulfillTranscriptFilterUpdate = makeActionCreator(
  'transcript/fulfillTranscriptFilterUpdate',
  isEnabled => ({ isEnabled })
)

export function reduce(state = { isLoading: false, isEnabled: false }, action) {
  switch(action.type) {
    case fulfillTranscriptFilterPreference.type:
    case fulfillTranscriptFilterUpdate.type:
      return { ...state, isEnabled: action.payload.isEnabled };
    case requestTranscriptFilterUpdate.type:
      return { ...state, isLoading: true };
    case ResultTableSummaryViewActions.fulfillAnswer.type:
      return { ...state, isLoading: false };
    default:
      return state;
  }
}

async function getFulfillTranscriptFilterPreference([ requestAction ], state$, { wdkService }) {
  const preferences = await wdkService.getCurrentUserPreferences();
  return fulfillTranscriptFilterPreference(preferences.project[REPRESENTATIVE_TRANSCRIPT_FILTER_NAME] === 'true')
}

async function getFulfillTranscriptFilterUpdate([ requestAction ], state$, { wdkService }) {
  await wdkService.patchUserPreference('project', REPRESENTATIVE_TRANSCRIPT_FILTER_NAME, requestAction.payload.shouldEnable ? 'true' : 'false')
  return fulfillTranscriptFilterUpdate(requestAction.payload.shouldEnable);
}

async function getFulillAnswer([ requestAction ], state$, { wdkService }) {
  const { stepId, answer: { meta: { sorting, attributes, pagination } } } = state$.value.resultTableSummaryView;
  const answer = await wdkService.getStepAnswerJson(
    stepId, { sorting, attributes, pagination }
  );
  return ResultTableSummaryViewActions.fulfillAnswer(stepId, { sorting, attributes }, pagination, answer);
}

export const observe = combineEpics(
  mrate([requestTranscriptFilterPreference], getFulfillTranscriptFilterPreference),
  mrate([requestTranscriptFilterUpdate], getFulfillTranscriptFilterUpdate),
  mrate([fulfillTranscriptFilterUpdate], getFulillAnswer)
)
