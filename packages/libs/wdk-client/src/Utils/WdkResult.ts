import {
  AnswerSpec,
  Answer,
  FilterValueArray,
  StandardReportConfig,
} from '../Utils/WdkModel';
import WdkService from '../Service/WdkService';
import { Step } from '../Utils/WdkUser';
import { AnswerFormatting } from '../Service/Mixins/SearchReportsService';

// This module contains utilities used by the ResultsPanel to abstract away the various
// ways that one can object a WDK result.

// There are three ways to think of results in WDK:
// 1) Results of a step
// 2) Results of a basket
// 3) Results of an answer spec
//
// Each type has its own set of endpoints from which to get reports, etc.

export interface StepResultType {
  type: 'step';
  step: Step;
}

export interface BasketResultType {
  type: 'basket';
  basketName: string;
}

export interface AnswerSpecResultType {
  type: 'answerSpec';
  answerSpec: AnswerSpec;
  displayName: string;
}

export type ResultType =
  | StepResultType
  | BasketResultType
  | AnswerSpecResultType;

export interface ResultTypeDetails {
  searchName: string;
  recordClassName: string;
}

export async function getResultTypeDetails(
  wdkService: WdkService,
  resultType: ResultType
): Promise<ResultTypeDetails> {
  switch (resultType.type) {
    case 'step': {
      const { searchName, recordClassName } = resultType.step;
      return { searchName, recordClassName };
    }
    case 'answerSpec': {
      const { searchName } = resultType.answerSpec;
      const question = await wdkService.findQuestion(searchName);
      if (question == null)
        throw new Error(
          `Answer spec has an unknown searchName: "${searchName}".`
        );
      return { searchName, recordClassName: question.outputRecordClassName };
    }
    case 'basket': {
      // We currently only suppport basket names that match with record type.
      // The following will need to be updated to support multiple baskets per
      // record type.
      const recordClass = await wdkService.findRecordClass(
        resultType.basketName
      );
      if (recordClass == null)
        throw new Error(
          `The basket with the name "${resultType.basketName}" does not exist.`
        );
      const searchNamePrefix = recordClass.fullName.replace('.', '_');
      const question = await wdkService.findQuestion(
        searchNamePrefix + 'ByRealtimeBasket'
      );
      if (question == null)
        throw new Error(
          `The basket with the name "${resultType.basketName}" does not exist.`
        );
      return {
        searchName: question.urlSegment,
        recordClassName: recordClass.urlSegment,
      };
    }
  }
}

export async function getStandardReport(
  wdkService: WdkService,
  resultType: ResultType,
  reportConfig: StandardReportConfig,
  viewFilters?: FilterValueArray
): Promise<Answer> {
  switch (resultType.type) {
    case 'step':
      return wdkService.getStepStandardReport(
        resultType.step.id,
        reportConfig,
        viewFilters
      );
    case 'basket':
      return wdkService.getBasketStandardReport(
        resultType.basketName,
        reportConfig,
        viewFilters
      );
    case 'answerSpec':
      return wdkService.getAnswerJson(
        resultType.answerSpec,
        reportConfig,
        viewFilters
      );
  }
}

export async function getCustomReport<T>(
  wdkService: WdkService,
  resultType: ResultType,
  formatting: AnswerFormatting
): Promise<T> {
  switch (resultType.type) {
    case 'step':
      return wdkService.getStepCustomReport(resultType.step.id, formatting);
    case 'basket':
      return wdkService.getBasketCustomReport<T>(
        resultType.basketName,
        formatting
      );
    case 'answerSpec':
      return wdkService.getAnswer<T>(resultType.answerSpec, formatting);
  }
}

export async function downloadReport(
  wdkService: WdkService,
  resultType: ResultType,
  formatting: AnswerFormatting,
  target: string
): Promise<void> {
  switch (resultType.type) {
    case 'step':
      return wdkService.downloadStepReport(
        resultType.step.id,
        formatting,
        target
      );
    case 'answerSpec':
      return wdkService.downloadAnswer(
        { answerSpec: resultType.answerSpec, formatting },
        target
      );
    case 'basket':
      return wdkService.downloadBasketReport(
        resultType.basketName,
        formatting,
        target
      );
  }
}
