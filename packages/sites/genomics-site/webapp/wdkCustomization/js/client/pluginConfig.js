import { negate } from 'lodash';
import { from, merge } from 'rxjs';
import { filter, mergeMap, takeUntil } from 'rxjs/operators';
import { HistogramAnalysisPlugin, WordCloudAnalysisPlugin } from 'wdk-client/Plugins';

export default [
  {
    type: 'attributeAnalysis',
    name: 'wordCloud',
    recordClass: 'TranscriptRecordClasses.TranscriptRecordClass',
    plugin: decorateTranscriptAttributeAnalysisPlugin(WordCloudAnalysisPlugin)
  },
  {
    type: 'attributeAnalysis',
    name: 'histogram',
    recordClass: 'TranscriptRecordClasses.TranscriptRecordClass',
    plugin: decorateTranscriptAttributeAnalysisPlugin(HistogramAnalysisPlugin)
  }
]

function decorateTranscriptAttributeAnalysisPlugin(plugin) {
  return {
    ...plugin,
    observe: decorateTranscriptAttributeAnalysisObserve(plugin.observe)
  }
}

function isRequestedAction(action) {
  return action.type === 'attribute-report/start-request';
}

function decorateTranscriptAttributeAnalysisObserve(observe) {
  return function observeTranscript(action$, state$, services) {
    const request$ = action$.pipe(filter(isRequestedAction));
    const rest$ = action$.pipe(filter(negate(isRequestedAction)));
    return merge(
      request$.pipe(
        mergeMap(({ payload: { reporterName, stepId }}) =>
          from(
            services.wdkService.getCurrentUserPreferences().then(
              preferences => preferences.project.representativeTranscriptOnly === 'true'
            )
            .then(
              representativeTranscriptOnly =>
              services.wdkService.getStepAnswer(stepId, { format: reporterName, formatConfig: { representativeTranscriptOnly } }).then(
                report => ({ type: 'attribute-report/end-request-success', payload: { report }}),
                error => ({ type: 'attribute-report/end-request-error', payload: { error }})
              ))
          ).pipe(takeUntil(action$.pipe(filter(action => action.type === 'attribute-reporter/cancelled'))))
        )
      ),
      observe(rest$, state$, services)
    )
  }
}
