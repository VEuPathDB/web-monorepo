import { Question, RecordClass, RecordInstance, getSingleRecordQuestionName, getSingleRecordAnswerSpec, SearchConfig, AnswerSpec } from 'wdk-client/Utils/WdkModel';
import WdkService from 'wdk-client/Service/WdkService';
import { Step, StepValidationLevel } from 'wdk-client/Utils/WdkUser';

export interface StepBundle {
  step: Step;
  question: Question;
  recordClass: RecordClass;
}

export interface AnswerSpecBundle {
  answerSpec: AnswerSpec;
  question: Question;
  recordClass: RecordClass;
  displayName: string;
}

/**
 * Fetches the step for the given ID and also finds the question and recordClass
 * for that step using the passed service.  Returns a promise whose value is an
 * object with properties { step, question, recordClass }.
 */
export function getStepBundlePromise(stepId: number, service: WdkService): Promise<StepBundle> {

  let stepPromise = service.findStep(stepId);
  let questionPromise = stepPromise.then(step => {
    return service.findQuestion( step.searchName )
    .then(question => {
      if (question == null) {
        throw new Error("The question `" + step.searchName + "` could not be found.");
      }
      return question;
    })
  });
  let recordClassPromise = questionPromise.then(question =>
    service.findRecordClass( question.outputRecordClassName )
  );

  return Promise.all([ stepPromise, questionPromise, recordClassPromise ])
    .then(([ step, question, recordClass ]) => ({ step, question, recordClass }));
}

/**
 * Looks up the single-record question for the passed recordClass and applies the
 * passed primary key to create an search config for that question.  Returns a promise
 * whose value is an object with properties { answerSpec, question, recordClass }.
 */
export function getSingleRecordStepBundlePromise(wdkService: WdkService) {
  return function([ recordClass, recordInstance ]: [ RecordClass, RecordInstance ]): Promise<AnswerSpecBundle> {

    // create single-record question and step for this record class
    let questionPromise: Promise<Question> = wdkService.findQuestion(getSingleRecordQuestionName(recordClass.fullName));
    let answerSpec = getSingleRecordAnswerSpec(recordInstance);
    let displayName = String(recordInstance.attributes[recordClass.recordIdAttributeName]) ||
      recordInstance.id.map(pk => pk.value).reduce((s, val) => (s == null ? val : '/' + val));

    // return a promise containing our generated bundle
    return questionPromise.then(question => Promise.resolve({ recordClass, question, answerSpec, displayName }));
  };
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
    displayPreferences: { } as Step['displayPreferences'],
    validation: {
      isValid: true,
      level: StepValidationLevel.Runnable
    }
  };
}
