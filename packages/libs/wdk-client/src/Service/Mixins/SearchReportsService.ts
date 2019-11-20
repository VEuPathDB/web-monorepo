import { ServiceBase } from 'wdk-client/Service/ServiceBase';
import stringify from 'json-stable-stringify';
import {
  AnswerSpec,
  StandardReportConfig,
  SearchConfig,
  Answer,
  FilterValueArray,
} from 'wdk-client/Utils/WdkModel';
import { submitAsForm } from 'wdk-client/Utils/FormSubmitter';


// Legacy, for backward compatibility of client code with older service API
export interface AnswerFormatting {
  format: string
  formatConfig: object
}

// Legacy, for backward compatibility of client code with older service API
export interface AnswerRequest {
  answerSpec: AnswerSpec,
  formatting: AnswerFormatting
}

export interface StandardSearchReportRequest {
  searchConfig: SearchConfig;
  reportConfig: StandardReportConfig;
}

export interface CustomSearchReportRequest {
  searchConfig: SearchConfig;
  reportConfig: object;
}

interface CustomSearchReportRequestInfo {
  url: string,
  request: CustomSearchReportRequest
}


export default (base: ServiceBase) => {

  async function getCustomSearchReportRequestInfo(answerSpec: AnswerSpec, formatting: AnswerFormatting): Promise<CustomSearchReportRequestInfo> {
    const question = await base.findQuestion(question => question.urlSegment === answerSpec.searchName);
    const recordClass = await base.findRecordClass(recordClass => recordClass.urlSegment === question.outputRecordClassName);
    let url = base.getCustomSearchReportEndpoint(recordClass.urlSegment, question.urlSegment, formatting.format);
    let searchConfig: SearchConfig = answerSpec.searchConfig;
    let reportConfig = formatting.formatConfig || {};
    let request: CustomSearchReportRequest = { searchConfig, reportConfig };
    return { url, request };
  }

  /**
   * Get an answer from the searches/{name}/reports/{name} service
   * This method uses the deprecated AnswerSpec and AnswerFormatting for backwards compatibility with bulk of client code
   */
  async function getAnswer<T>(answerSpec: AnswerSpec, formatting: AnswerFormatting): Promise<T> {
    let info = await getCustomSearchReportRequestInfo(answerSpec, formatting);
    return base._fetchJson<T>('post', info.url, stringify(info.request));
  }

  /**
   * Get an answer from the searches/{name}/reports/standard service
   * This method uses the deprecated AnswerSpec and AnswerFormatting for backwards compatibility with bulk of client code
   */
  async function getAnswerJson(answerSpec: AnswerSpec, reportConfig: StandardReportConfig, viewFilters?: FilterValueArray): Promise<Answer> {
    const question = await base.findQuestion(question => question.urlSegment === answerSpec.searchName);
    const recordClass = await base.findRecordClass(recordClass => recordClass.urlSegment === question.outputRecordClassName);
    let url = base.getStandardSearchReportEndpoint(recordClass.urlSegment, question.urlSegment);
    let searchConfig: SearchConfig = answerSpec.searchConfig
    let body: StandardSearchReportRequest = { searchConfig, reportConfig };
    return base._fetchJson<Answer>('post', url, stringify(body));
  }

  async function downloadAnswer(answerRequest: AnswerRequest, target = '_blank') {

    let info = await getCustomSearchReportRequestInfo(answerRequest.answerSpec, answerRequest.formatting);

    // a submission must trigger a form download, meaning we must POST the form
    submitAsForm({
      method: 'post',
      action: base.serviceUrl + info.url,
      target: target,
      inputs: {
        data: JSON.stringify(info.request)
      }
    });
  }

  return {
    getCustomSearchReportRequestInfo,
    getAnswer,
    getAnswerJson,
    downloadAnswer
  }
}
