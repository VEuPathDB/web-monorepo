import {
  Decoder,
  arrayOf,
  boolean,
  combine,
  constant,
  field,
  number,
  objectOf,
  string,
  oneOf,
  nullValue,
  optional
} from './Json';
import { ParameterGroup, Parameter } from './WdkModel';
import { paramGroupDecoder } from '../Service/Mixins/SearchesService';

export interface StepAnalysis {
  analysisId: number,
  displayName: string
}

export interface StepAnalysisType {
  displayName: string,
  releaseVersion: string,
  name: string,
  description: string,
  customThumbnail?: string,
  shortDescription: string,
  paramNames: string[],
  groups: ParameterGroup[]
}

export interface FormParams {
  [key: string]: string
}

export type StepAnalysisStatus =
  | 'CREATED'
  | 'STEP_REVISED'
  | 'INVALID'
  | 'PENDING'
  | 'RUNNING'
  | 'COMPLETE'
  | 'INTERRUPTED'
  | 'ERROR'
  | 'EXPIRED'
  | 'OUT_OF_DATE'
  | 'UNKNOWN';

export type InvalidStepReason = string | null;

export interface StepAnalysisConfig {
  analysisId: number,
  stepId: number,
  hasParams: boolean,
  analysisName: string,
  answerValueHash: string,
  formParams: FormParams,
  displayName: string,
  shortDescription: string,
  description: string,
  userNotes?: string,
  status: StepAnalysisStatus,
  invalidStepReason: InvalidStepReason
}

export const stepAnalysisDecoder: Decoder<StepAnalysis> = combine(
  field('analysisId', number),
  field('displayName', string)
);

export const stepAnalysisTypeDecoder: Decoder<StepAnalysisType> = combine(
  field('displayName', string),
  field('releaseVersion', string),
  field('name', string),
  field('description', string),
  field('customThumbnail', optional(string)),
  field('shortDescription', string),
  field('paramNames', arrayOf(string)),
  field('groups', arrayOf(paramGroupDecoder))
);

export const formParamsDecoder: Decoder<FormParams> = objectOf(string);

export const stepAnalysisStatusDecoder: Decoder<StepAnalysisStatus> = oneOf(
  constant('CREATED'),
  constant('STEP_REVISED'),
  constant('INVALID'),
  constant('PENDING'),
  constant('RUNNING'),
  constant('COMPLETE'),
  constant('INTERRUPTED'),
  constant('ERROR'),
  constant('EXPIRED'),
  constant('OUT_OF_DATE'),
  constant('UNKNOWN')
);

export const invalidStepReasonDecoder: Decoder<InvalidStepReason> = oneOf(
  string,
  nullValue
);

export const stepAnalysisConfigDecoder: Decoder<StepAnalysisConfig> = combine(
  combine(
    field('analysisId', number),
    field('stepId', number),
    field('hasParams', boolean),
    field('analysisName', string),
    field('answerValueHash', string),
    field('displayName', string),
    field('shortDescription', string),
    field('description', string),
    field('userNotes', optional(string))
  ),
  combine(
    field('status', stepAnalysisStatusDecoder),
    field('invalidStepReason', invalidStepReasonDecoder),
    field('formParams', formParamsDecoder)
  )
);
