import { Observable } from 'rxjs';
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

function decorateTranscriptAttributeAnalysisObserve(observe) {
  return function observeTranscript(action$, services) {
    const [ request$, rest$ ] = action$.partition(action => action.type === 'attribute-reporter/requested');
    return request$.mergeMap(({ payload: { reporterName, stepId }}) =>
      Observable.from(
        services.wdkService.getCurrentUserPreferences().then(
          preferences => preferences.project.representativeTranscriptOnly === 'true'
        )
        .then(
          representativeTranscriptOnly =>
            services.wdkService.getStepAnswer(stepId, { format: reporterName, formatConfig: { representativeTranscriptOnly } }).then(
              report => ({ type: 'attribute-reporter/received', payload: { report }}),
              error => ({ type: 'attribute-reporter/failed', payload: { error }})
            ))
        )
        .takeUntil(action$.filter(action => action.type === 'attribute-reporter/cancelled'))
    ).merge(observe(rest$, services))
  }
}