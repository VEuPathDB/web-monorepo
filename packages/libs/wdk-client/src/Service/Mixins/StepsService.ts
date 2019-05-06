import { ServiceBaseClass } from 'wdk-client/Service/ServiceBase';
import { omit } from 'lodash';

import {
    NewStepSpec,
    PatchStepSpec,
    StandardReportConfig,
    AnswerSpec,
} from 'wdk-client/Utils/WdkModel';
import { Step, } from 'wdk-client/Utils/WdkUser';
import * as Decode from 'wdk-client/Utils/Json';

// Legacy, for backward compatibility of client code with older service API
export interface AnswerFormatting {
    format: string
    formatConfig?: object
}

export default (base: ServiceBaseClass) => class StepsService extends base {

    private _stepMap = new Map<number, Promise<Step>>();

    findStep(stepId: number, userId: string = "current"): Promise<Step> {
        // cache step resonse
        if (!this._stepMap.has(stepId)) {
            this._stepMap.set(stepId, this._fetchJson<Step>('get', `/users/${userId}/steps/${stepId}`).catch(error => {
                // if the request fails, remove the response since a later request might succeed
                this._stepMap.delete(stepId);
                throw error;
            }))
        }
        return this._stepMap.get(stepId)!;
    }

    updateStep(stepId: number, stepSpec: PatchStepSpec, userId: string = 'current'): Promise<Step> {
        let data = JSON.stringify(stepSpec);
        let url = `/users/${userId}/steps/${stepId}`;
        this._stepMap.set(stepId, this._fetchJson<Step>('patch', url, data).catch(error => {
            // if the request fails, remove the response since a later request might succeed
            this._stepMap.delete(stepId);
            throw error;
        }));
        return this._stepMap.get(stepId)!;
    }

    createStep(newStepSpec: NewStepSpec, userId: string = "current") {
        return this._fetchJson<Step>('post', `/users/${userId}/steps`, JSON.stringify(newStepSpec));
    }

    getStepAnswer(stepId: number, formatting: AnswerFormatting, userId: string = 'current') : any {
        omit
        let reportConfing = formatting.formatConfig;

        return this.sendRequest(Decode.ok, {
            method: 'post',
            path: `/users/${userId}/steps/${stepId}/reports/${formatting.format}`,
            body: JSON.stringify(reportConfing)
        });
    }

    // get step's answer in wdk default json output format
    // TODO:  use a proper decoder to ensure correct decoding of the Answer
    getStepAnswerJson(stepId: number, reportConfig: StandardReportConfig, userId: string = 'current') {
        return this.sendRequest(Decode.ok, {
            method: 'post',
            path: `/users/${userId}/steps/${stepId}/reports/standard`,
            body: JSON.stringify(reportConfig)
        });
    }

    // step filters are dynamically typed, so have to pass in the expected type
    getStepFilterSummary<T>(
        decoder: Decode.Decoder<T>,
        stepId: number,
        filterName: string,
        userId: string = 'current'
    ) {
        return this.sendRequest(decoder, {
            method: 'get',
            path: `/users/${userId}/steps/${stepId}/answer/filter-summary/${filterName}`
        })
    }

    deleteStep(stepId: number, userId: string = "current"): void {
        if (this._stepMap.has(stepId)) this._stepMap.delete(stepId); 
        this._fetchJson<void>('delete', `/users/${userId}/steps/${stepId}`);
    }

    updateStepSearchConfig(stepId: number, newStepSpec: AnswerSpec, userId: string = "current") {
        return this._fetchJson<Step>('put', `/users/${userId}/steps/${stepId}/search-config`, JSON.stringify(newStepSpec));
    }

}