import { Question, RecordClass, RecordInstance, getSingleRecordQuestionName, SearchConfig } from 'wdk-client/Utils/WdkModel';
import WdkService from 'wdk-client/Service/WdkService';
import { Step } from 'wdk-client/Utils/WdkUser';

export interface StepBundle {
  step: Step;
  question: Question;
  recordClass: RecordClass;
}

/**
 * Fetches the step for the given ID and also finds the question and recordClass
 * for that step using the passed service.  Returns a promise whose value is an
 * object with properties { step, question, recordClass }.
 */
export function getStepBundlePromise(stepId: number, service: WdkService): Promise<StepBundle> {

  let stepPromise = service.findStep(stepId);
  let questionPromise = stepPromise.then(step => {
    return service.findQuestion( q => q.urlSegment === step.searchName )
    .then(question => {
      if (question == null) {
        throw new Error("The question `" + step.searchName + "` could not be found.");
      }
      return question;
    })
  });
  let recordClassPromise = questionPromise.then(question =>
    service.findRecordClass( rc => rc.urlSegment === question.outputRecordClassName )
  );

  return Promise.all([ stepPromise, questionPromise, recordClassPromise ])
    .then(([ step, question, recordClass ]) => ({ step, question, recordClass }));
}

/**
 * Creates a single-record question for the passed recordClass and applies the
 * passed primary key to create a step of that question.  Returns a promise
 * whose value is an object with properties { step, question, recordClass }.
 */
export function getSingleRecordStepBundlePromise(
  [ recordClass, recordInstance, primaryKeyString ]: [ RecordClass, RecordInstance, string]
): Promise<StepBundle> {

  // create single-record question and step for this record class
  let searchName: string = getSingleRecordQuestionName(recordClass.fullName);
  let displayName = String(recordInstance.attributes[recordClass.recordIdAttributeName]) || primaryKeyString;

  // TODO: if this is used in places other than step download form, may need
  //   to fill in more fields and think about what their values should be
  let question: Question = {
    fullName: searchName,
    urlSegment: searchName,
    outputRecordClassName: recordClass.fullName,
    displayName: 'Single Record',
    shortDisplayName: 'Single Record',
    description: 'Retrieves a single record by ID',
    help: '',
    summary: '',
    newBuild: '0',
    reviseBuild: '0',
    groups: [],
    defaultAttributes: [ ],
    defaultSorting: [ ],
    dynamicAttributes: [ ],
    defaultSummaryView: '_default',
    summaryViewPlugins: [ ],
    stepAnalysisPlugins: [ ],
    filters: [ ],
    paramNames: [ "primaryKeys" ]
  };

  let step: Step = getStubbedStep(question, displayName, 1, {
    parameters: {
      "primaryKeys": primaryKeyString
    }
  });

  // return a promise containing our generated bundle
  return Promise.resolve({ recordClass, question, step });
}

export function getStubbedStep(question: Question, displayName: string, estimatedSize: number, searchConfig: SearchConfig): Step {
  return {
    // fill primary key string so we know which single record this question is
    id: -1,
    isFiltered: false,
    strategyId: -1,
    ownerId: -1,
    recordClassName: question.outputRecordClassName,
    displayName: displayName,
    shortDisplayName: displayName,
    customName: displayName,
    description: 'Generated Step Stub',
    estimatedSize: estimatedSize,
    expanded: false,
    hasCompleteStepAnalyses: false,
    searchName: question.urlSegment,
    searchConfig: searchConfig,
    displayPreferences: { } as Step['displayPreferences']
  };
}
