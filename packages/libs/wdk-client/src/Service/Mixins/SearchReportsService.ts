import { ServiceBase } from '../../Service/ServiceBase';
import stringify from 'json-stable-stringify';
import {
  AnswerSpec,
  StandardReportConfig,
  SearchConfig,
  Answer,
  FilterValueArray,
} from '../../Utils/WdkModel';
import { submitAsForm } from '../../Utils/FormSubmitter';
import { number, record, string } from '../../Utils/Json';

// Legacy, for backward compatibility of client code with older service API
export interface AnswerFormatting {
  format: string;
  formatConfig: object;
}

// Legacy, for backward compatibility of client code with older service API
export interface AnswerRequest {
  answerSpec: AnswerSpec;
  formatting: AnswerFormatting;
}

export interface StandardSearchReportRequest {
  searchConfig: SearchConfig;
  reportConfig: StandardReportConfig;
}

export interface CustomSearchReportRequest {
  searchConfig: SearchConfig;
  reportConfig: object;
}

export interface CustomSearchReportRequestInfo {
  url: string;
  request: CustomSearchReportRequest;
}

export default (base: ServiceBase) => {
  async function getCustomSearchReportRequestInfo(
    answerSpec: AnswerSpec,
    formatting: AnswerFormatting
  ): Promise<CustomSearchReportRequestInfo> {
    const question = await base.findQuestion(answerSpec.searchName);
    const recordClass = await base.findRecordClass(
      question.outputRecordClassName
    );
    let url = base.getCustomSearchReportEndpoint(
      recordClass.urlSegment,
      question.urlSegment,
      formatting.format
    );
    let searchConfig: SearchConfig = answerSpec.searchConfig;
    let reportConfig = formatting.formatConfig || {};
    let request: CustomSearchReportRequest = { searchConfig, reportConfig };
    return { url, request };
  }

  /**
   * Get an answer from the searches/{name}/reports/{name} service
   * This method uses the deprecated AnswerSpec and AnswerFormatting for backwards compatibility with bulk of client code
   */
  async function getAnswer<T>(
    answerSpec: AnswerSpec,
    formatting: AnswerFormatting
  ): Promise<T> {
    let info = await getCustomSearchReportRequestInfo(answerSpec, formatting);
    return base._fetchJson<T>('post', info.url, stringify(info.request));
  }

  /**
   * Get an answer from the searches/{name}/reports/standard service
   * This method uses the deprecated AnswerSpec and AnswerFormatting for backwards compatibility with bulk of client code
   */
  async function getAnswerJson(
    answerSpec: AnswerSpec,
    reportConfig: StandardReportConfig,
    viewFilters?: FilterValueArray
  ): Promise<Answer> {
    const question = await base.findQuestion(answerSpec.searchName);
    const recordClass = await base.findRecordClass(
      question.outputRecordClassName
    );
    let url = base.getStandardSearchReportEndpoint(
      recordClass.urlSegment,
      question.urlSegment
    );
    let searchConfig: SearchConfig = answerSpec.searchConfig;
    const reportConfigWithResponseBufferingSet: StandardReportConfig = {
      ...reportConfig,
      bufferEntireResponse: reportConfig.bufferEntireResponse ?? true,
    };
    let body: StandardSearchReportRequest = {
      searchConfig,
      reportConfig: reportConfigWithResponseBufferingSet,
    };
    return base._fetchJson<Answer>('post', url, stringify(body));
  }

  async function downloadAnswer(
    answerRequest: AnswerRequest,
    target = '_blank'
  ) {
    let info = await getCustomSearchReportRequestInfo(
      answerRequest.answerSpec,
      answerRequest.formatting
    );

    // a submission must trigger a form download, meaning we must POST the form
    submitAsForm({
      method: 'post',
      action: base.serviceUrl + info.url,
      target: target,
      inputs: {
        data: JSON.stringify(info.request),
      },
    });
  }

  async function getTemporaryResultPath(
    answerSpecOrStepId: AnswerSpec | number,
    reportName: string,
    reportConfig: unknown
  ) {
    const reportSubrequest = {
      reportName: reportName,
      reportConfig: reportConfig,
    };

    const requestBody =
      typeof answerSpecOrStepId === 'number'
        ? stringify({
            ...reportSubrequest,
            stepId: answerSpecOrStepId,
          })
        : stringify({
            ...reportSubrequest,
            searchName: answerSpecOrStepId.searchName,
            searchConfig: answerSpecOrStepId.searchConfig,
          });

    const { id } = await base.sendRequest<{ id: string }>(
      record({ id: string }),
      {
        method: 'post',
        path: '/temporary-results',
        body: requestBody,
      }
    );

    return '/temporary-results/' + id;
  }

  return {
    getCustomSearchReportRequestInfo,
    getAnswer,
    getAnswerJson,
    getTemporaryResultPath,
    downloadAnswer,
  };
};
