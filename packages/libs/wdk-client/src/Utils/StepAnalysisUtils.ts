import {
  Decoder,
  arrayOf,
  combine,
  constant,
  field,
  nullValue,
  number,
  objectOf,
  ok,
  oneOf,
  optional,
  record,
  string
} from './Json';
import { ParameterGroup, ParameterValues } from './WdkModel';
import { paramGroupDecoder } from '../Service/Mixins/SearchesService';
import { ValidStepValidation, InvalidStepValidation } from 'wdk-client/Utils/WdkUser';

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

export type FormParams = ParameterValues;

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
  analysisName: string,
  parameters: FormParams,
  displayName: string,
  shortDescription?: string,
  description?: string,
  userNotes?: string,
  status: StepAnalysisStatus,
  validation: ValidStepValidation | InvalidStepValidation
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

export const stepAnalysisConfigDecoder: Decoder<StepAnalysisConfig> = record({
  analysisId: number,
  stepId: number,
  analysisName: string,
  displayName: string,
  shortDescription: optional(string),
  description: optional(string),
  userNotes: optional(string),
  status: stepAnalysisStatusDecoder,
  parameters: formParamsDecoder,
  validation: ok // FIXME: Make decoders for ValidStepValidation and InvalidStepValidation
});
