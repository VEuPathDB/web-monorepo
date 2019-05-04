import { ServiceBaseClass } from 'wdk-client/Service/ServiceBase';
import stringify from 'json-stable-stringify';
import {
    AnswerSpec,
    StandardReportConfig,
    SearchConfig,
    Answer,
  } from 'wdk-client/Utils/WdkModel';
import { submitAsForm } from 'wdk-client/Utils/FormSubmitter';


// Legacy, for backward compatibility of client code with older service API
export interface AnswerFormatting {
    format: string
    formatConfig?: object
  }
  
  // Legacy, for backward compatibility of client code with older service API
  export interface AnswerRequest {
    answerSpec: AnswerSpec,
    formatting: AnswerFormatting
  }
  
  export interface StandardSearchReportRequest {
    searchConfig: SearchConfig;
    reportConfig?: StandardReportConfig;
  }
  
  export interface CustomSearchReportRequest {
    searchConfig: SearchConfig;
    reportConfig?: object;
  }
 
  interface CustomSearchReportRequestInfo {
    url: string,
    request: CustomSearchReportRequest
  }
  
  
export default (base: ServiceBaseClass) => class RecordTypeService extends base {

    private  async getCustomSearchReportRequestInfo (answerSpec: AnswerSpec, formatting: AnswerFormatting): Promise<CustomSearchReportRequestInfo>{
        const question = await this.findQuestion(question => question.urlSegment === answerSpec.searchName );
        const recordClass = await this.findRecordClass(recordClass => recordClass.fullName === question.outputRecordClassName);
        let url = this.getCustomSearchReportEndpoint(recordClass.urlSegment, question.urlSegment, formatting.format);
        let searchConfig: SearchConfig = answerSpec.searchConfig;
        let reportConfig = formatting.formatConfig;
        let request: CustomSearchReportRequest = { searchConfig, reportConfig };
        return {url, request};
      }
    
      /**
       * Get an answer from the searches/{name}/reports/{name} service
       * This method uses the deprecated AnswerSpec and AnswerFormatting for backwards compatibility with bulk of client code
       */
      async getAnswer(answerSpec: AnswerSpec, formatting: AnswerFormatting): Promise<Answer> {
        let info = await this.getCustomSearchReportRequestInfo(answerSpec, formatting);
        return this._fetchJson<Answer>('post', info.url, stringify(info.request));
      }
    
      /**
       * Get an answer from the searches/{name}/reports/standard service
       * This method uses the deprecated AnswerSpec and AnswerFormatting for backwards compatibility with bulk of client code
       */
      async getAnswerJson(answerSpec: AnswerSpec, reportConfig: StandardReportConfig): Promise<Answer> {
        const question = await this.findQuestion(question => question.urlSegment === answerSpec.searchName );
        const recordClass = await this.findRecordClass(recordClass => recordClass.fullName === question.outputRecordClassName);
        let url = this.getStandardSearchReportEndpoint(recordClass.urlSegment, question.urlSegment);
        let searchConfig: SearchConfig = answerSpec.searchConfig
        let body: StandardSearchReportRequest = { searchConfig, reportConfig };
        return this._fetchJson<Answer>('post', url, stringify(body));
      }
    
      async downloadAnswer(answerRequest: AnswerRequest, target = '_blank') {
    
        let info = await this.getCustomSearchReportRequestInfo(answerRequest.answerSpec, answerRequest.formatting);
    
        // a submission must trigger a form download, meaning we must POST the form
        submitAsForm({
          method: 'post',
          action: info.url,
          target: target,
          inputs: {
            data: JSON.stringify(info.request)
          }
        });
      }
    
    
}