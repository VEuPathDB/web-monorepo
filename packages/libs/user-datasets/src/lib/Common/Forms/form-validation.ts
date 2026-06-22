import { DatasetPostDetails, PostCharacteristics, ValidationErrors } from '../../Service';
import { isEmpty } from 'lodash';
import { JsonPathBuilder } from '../../Utils';
import { DatasetFormConfig } from '../Configuration';
import { RefObject } from 'react';

export interface ValidationRules {
  readonly useStudyChars: boolean;
  readonly useExperimentalOrganism: boolean;
}


export function isDatasetFormValid(
  metadata: DatasetPostDetails,
  config: DatasetFormConfig,
  uploadSection: RefObject<HTMLElement>
): boolean {
  const allInputsValid =
    uploadSection.current?.querySelectorAll(':invalid').length === 0;

  const noCustomErrors =
    uploadSection.current?.querySelectorAll('.invalid').length === 0;

  const missingDependencies =
    config.dependencies?.required === true && isEmpty(metadata.dependencies);

  console.log(allInputsValid, noCustomErrors, missingDependencies);

  return allInputsValid && noCustomErrors && !missingDependencies;
}


export function ValidateDatasetInput(
  details: DatasetPostDetails,
  jPath: JsonPathBuilder,
  rules: ValidationRules,
): ValidationErrors | null {
  const errors = new ValErrs();

  baseValidation(details, jPath, errors);

  if (details.visibility === 'public')
    communityValidation(details, rules, jPath, errors);

  return errors.isEmpty ? null : errors;
}

class ValErrs implements ValidationErrors {
  byKey: Record<string, string[]> = {};
  general: string[] = [];

  add(error: string): void;
  add(key: string, error: string): void;
  add(key: string, error?: string): void {
    if (error === undefined) this.general.push(key);
    else if (Object.hasOwn(this.byKey, key)) this.byKey[key].push(error);
    else this.byKey[key] = [error];
  }

  get isEmpty(): boolean {
    return isEmpty(this.byKey) && isEmpty(this.general);
  }
}

const stringLengthError =
  (min: number, max: number) => `must be ${min} to ${max} characters in length`;

function baseValidation(
  details: DatasetPostDetails,
  jPath: JsonPathBuilder,
  errors: ValErrs,
) {
  requireLengthInRange(details, 'name', 3, 1024, jPath, errors);
  requireLengthInRange(details, 'summary', 3, 4000, jPath, errors);
}

function communityValidation(
  details: DatasetPostDetails,
  rules: ValidationRules,
  jPath: JsonPathBuilder,
  errors: ValidationErrors,
) {
  // if (rules.useStudyChars)

}

function communityStudyCharacteristicsValidation(
  chars: PostCharacteristics,
  jPath: JsonPathBuilder,
  errors: ValErrs,
) {
  requireValue(chars, 'studyDesign', jPath, errors);
  requireValue(chars, 'studyType', jPath, errors);
  requireValue(chars, 'countries', jPath, errors);
  // TODO: years validation
  // requireValue(chars, 'studySpecies', )
}

function requireValue<T extends object>(
  obj: T,
  key: keyof T,
  jPath: JsonPathBuilder,
  errors: ValErrs
) {
  if (!obj[key])
    errors.add(jPath.appendToString<T>(key), "value is required");
}

function requireLengthInRange<T extends object>(
  obj: T,
  key: keyof T,
  min: number,
  max: number,
  jPath: JsonPathBuilder,
  errors: ValErrs
) {
  if (!lengthInRange((obj[key] as string | undefined)?.trim(), min, max))
    errors.add(jPath.appendToString<T>(key), stringLengthError(min, max));
}

function lengthInRange(val: string | undefined, min: number, max: number): boolean {
  return typeof val === 'string'
    && val.length >= min
    && val.length <= max;
}