/* eslint-disable @typescript-eslint/no-redeclare */
import * as t from 'io-ts';
import { isRight } from 'fp-ts/Either';
import { VariableDescriptor } from '../types/variable';
import { Filter } from '../types/filter';
import { StudyEntity } from '../types/study';
import { findEntityAndVariable } from '../utils/study-metadata';
import { ancestorEntitiesForEntityId } from '../utils/data-element-constraints';
import {
  DerivedVariableSpec,
  FILTER_DEFINED_GROUPS,
  FilterDefinedGroup,
  FilterDefinedGroupsSpec,
  isFilterDefinedGroupsSpec,
} from './types';

export const CATEGORICAL_RECODING = 'categoricalRecoding';
export const CONTINUOUS_TO_ORDINAL = 'continuousToOrdinal';
export const CONTINUOUS_DATE_TO_ORDINAL = 'continuousDateToOrdinal';

/**
 * The input variables each server plugin accepts, mirroring its
 * `checkVariable` call in service-eda (merge/plugins/transforms:
 * CategoricalRecoding, ContinuousNumericToOrdinal, ContinuousDateToOrdinal).
 * The server rejects every request that includes a spec whose input variable
 * doesn't match, so toRecoderSpec falls back to the filter-based form instead.
 * `types` undefined means any variable type.
 */
const ACCEPTED_INPUTS: Record<
  string,
  { types?: string[]; dataShapes: string[] }
> = {
  [CATEGORICAL_RECODING]: { dataShapes: ['categorical', 'binary'] },
  [CONTINUOUS_TO_ORDINAL]: {
    types: ['integer', 'number'],
    dataShapes: ['continuous'],
  },
  [CONTINUOUS_DATE_TO_ORDINAL]: { types: ['date'], dataShapes: ['continuous'] },
};

function serverAcceptsInput(
  functionName: string,
  variable: { type: string; dataShape: string }
): boolean {
  const accepted = ACCEPTED_INPUTS[functionName];
  return (
    accepted != null &&
    (accepted.types == null || accepted.types.includes(variable.type)) &&
    accepted.dataShapes.includes(variable.dataShape)
  );
}

const unmappedPartial = t.partial({ unmappedValue: t.string });

export type CategoricalRecodingConfig = t.TypeOf<
  typeof CategoricalRecodingConfig
>;
export const CategoricalRecodingConfig = t.intersection([
  t.type({
    inputVariable: VariableDescriptor,
    rules: t.array(
      t.intersection([
        t.type({ outputValue: t.string }),
        t.partial({
          inputValues: t.array(t.string),
          inputPrefixes: t.array(t.string),
        }),
      ])
    ),
  }),
  unmappedPartial,
]);

export type ContinuousNumericRecodingConfig = t.TypeOf<
  typeof ContinuousNumericRecodingConfig
>;
export const ContinuousNumericRecodingConfig = t.intersection([
  t.type({
    inputVariable: VariableDescriptor,
    rules: t.array(
      t.intersection([
        t.type({ outputValue: t.string }),
        t.partial({ minInclusive: t.number, maxInclusive: t.number }),
      ])
    ),
  }),
  unmappedPartial,
]);

export type ContinuousDateRecodingConfig = t.TypeOf<
  typeof ContinuousDateRecodingConfig
>;
export const ContinuousDateRecodingConfig = t.intersection([
  t.type({
    inputVariable: VariableDescriptor,
    rules: t.array(
      t.intersection([
        t.type({ outputValue: t.string }),
        t.partial({ minInclusive: t.string, maxInclusive: t.string }),
      ])
    ),
  }),
  unmappedPartial,
]);

type RecoderFilterType =
  | 'stringSet'
  | 'stringPrefixSet'
  | 'numberRange'
  | 'dateRange';

function withUnmapped(unmappedValue: string | undefined) {
  return unmappedValue ? { unmappedValue } : {};
}

/**
 * Converts groups to a recoder spec when every group is one filter on the
 * same variable (see the derived-variables design, section 4). Returns
 * undefined when the groups need the filter-based form.
 */
export function toRecoderSpec(
  spec: FilterDefinedGroupsSpec,
  entities: StudyEntity[]
): DerivedVariableSpec | undefined {
  const { groups, unmappedValue } = spec.config;
  if (groups.length === 0) return undefined;
  if (groups.some((g) => g.filters.length !== 1)) return undefined;
  const filters = groups.map((g) => g.filters[0]);
  const first = filters[0];
  const inputVariable = {
    entityId: first.entityId,
    variableId: first.variableId,
  };
  if (
    filters.some(
      (f) =>
        f.entityId !== inputVariable.entityId ||
        f.variableId !== inputVariable.variableId ||
        f.type !== first.type
    )
  )
    return undefined;

  const found = findEntityAndVariable(entities, inputVariable);
  if (found == null) return undefined;
  const ancestors = ancestorEntitiesForEntityId(spec.entityId, entities);
  if (!ancestors.some((e) => e.id === found.entity.id)) return undefined;
  const variable = found.variable;
  if (
    !('dataShape' in variable) ||
    variable.dataShape === 'binary' ||
    variable.isMultiValued ||
    ('imputeZero' in variable && variable.imputeZero === true)
  )
    return undefined;

  const common = {
    entityId: spec.entityId,
    variableId: spec.variableId,
    displayName: spec.displayName,
  };
  const labels = groups.map((g) => g.label);
  const tail = withUnmapped(unmappedValue);
  const accepts = (functionName: string) =>
    serverAcceptsInput(functionName, {
      type: variable.type,
      dataShape: variable.dataShape ?? '',
    });

  switch (first.type) {
    case 'stringSet':
    case 'stringPrefixSet': {
      if (!accepts(CATEGORICAL_RECODING)) return undefined;
      const rules: CategoricalRecodingConfig['rules'] = [];
      for (let i = 0; i < filters.length; i++) {
        const f = filters[i];
        if (f.type === 'stringSet' && f.stringSet.length > 0)
          rules.push({ inputValues: f.stringSet, outputValue: labels[i] });
        else if (f.type === 'stringPrefixSet' && f.prefixSet.length > 0)
          rules.push({ inputPrefixes: f.prefixSet, outputValue: labels[i] });
        else return undefined;
      }
      return {
        ...common,
        functionName: CATEGORICAL_RECODING,
        config: { inputVariable, rules, ...tail },
      };
    }
    case 'numberRange': {
      if (!accepts(CONTINUOUS_TO_ORDINAL)) return undefined;
      const rules: ContinuousNumericRecodingConfig['rules'] = [];
      for (let i = 0; i < filters.length; i++) {
        const f = filters[i];
        if (f.type !== 'numberRange') return undefined;
        rules.push({
          minInclusive: f.min,
          maxInclusive: f.max,
          outputValue: labels[i],
        });
      }
      return {
        ...common,
        functionName: CONTINUOUS_TO_ORDINAL,
        config: { inputVariable, rules, ...tail },
      };
    }
    case 'dateRange': {
      if (!accepts(CONTINUOUS_DATE_TO_ORDINAL)) return undefined;
      const rules: ContinuousDateRecodingConfig['rules'] = [];
      for (let i = 0; i < filters.length; i++) {
        const f = filters[i];
        if (f.type !== 'dateRange') return undefined;
        rules.push({
          minInclusive: f.min,
          maxInclusive: f.max,
          outputValue: labels[i],
        });
      }
      return {
        ...common,
        functionName: CONTINUOUS_DATE_TO_ORDINAL,
        config: { inputVariable, rules, ...tail },
      };
    }
    default:
      return undefined;
  }
}

/** The spec to store: the recoder form when eligible, otherwise `spec`. */
export function toStoredSpec(
  spec: FilterDefinedGroupsSpec,
  entities: StudyEntity[]
): DerivedVariableSpec {
  return toRecoderSpec(spec, entities) ?? spec;
}

/**
 * Converts a recoder spec back to groups for the editor. Returns undefined
 * if the spec cannot be represented exactly (so the caller treats it as
 * unsupported and leaves it untouched).
 */
export function fromRecoderSpec(
  spec: DerivedVariableSpec
): FilterDefinedGroupsSpec | undefined {
  let unmappedValue: string | undefined;

  const build = (
    outputs: string[],
    makeFilters: Array<Filter | undefined>
  ): FilterDefinedGroup[] | undefined => {
    if (outputs.length === 0) return undefined;
    if (new Set(outputs).size !== outputs.length) return undefined;
    const result: FilterDefinedGroup[] = [];
    for (let i = 0; i < outputs.length; i++) {
      const filter = makeFilters[i];
      if (filter == null) return undefined;
      result.push({ label: outputs[i], filters: [filter] });
    }
    return result;
  };

  const decodedInput = t
    .type({ inputVariable: VariableDescriptor })
    .decode(spec.config);
  if (!isRight(decodedInput)) return undefined;
  const { inputVariable } = decodedInput.right;

  let built: FilterDefinedGroup[] | undefined;
  switch (spec.functionName) {
    case CATEGORICAL_RECODING: {
      const decoded = CategoricalRecodingConfig.decode(spec.config);
      if (!isRight(decoded)) return undefined;
      unmappedValue = decoded.right.unmappedValue;
      built = build(
        decoded.right.rules.map((r) => r.outputValue),
        decoded.right.rules.map((r): Filter | undefined => {
          const { inputValues, inputPrefixes } = r;
          if (inputValues != null && inputPrefixes == null)
            return inputValues.length > 0
              ? { type: 'stringSet', ...inputVariable, stringSet: inputValues }
              : undefined;
          if (inputPrefixes != null && inputValues == null)
            return inputPrefixes.length > 0
              ? {
                  type: 'stringPrefixSet',
                  ...inputVariable,
                  prefixSet: inputPrefixes,
                }
              : undefined;
          return undefined;
        })
      );
      break;
    }
    case CONTINUOUS_TO_ORDINAL: {
      const decoded = ContinuousNumericRecodingConfig.decode(spec.config);
      if (!isRight(decoded)) return undefined;
      unmappedValue = decoded.right.unmappedValue;
      built = build(
        decoded.right.rules.map((r) => r.outputValue),
        decoded.right.rules.map((r): Filter | undefined =>
          r.minInclusive != null && r.maxInclusive != null
            ? {
                type: 'numberRange',
                ...inputVariable,
                min: r.minInclusive,
                max: r.maxInclusive,
              }
            : undefined
        )
      );
      break;
    }
    case CONTINUOUS_DATE_TO_ORDINAL: {
      const decoded = ContinuousDateRecodingConfig.decode(spec.config);
      if (!isRight(decoded)) return undefined;
      unmappedValue = decoded.right.unmappedValue;
      built = build(
        decoded.right.rules.map((r) => r.outputValue),
        decoded.right.rules.map((r): Filter | undefined =>
          r.minInclusive != null && r.maxInclusive != null
            ? {
                type: 'dateRange',
                ...inputVariable,
                min: r.minInclusive,
                max: r.maxInclusive,
              }
            : undefined
        )
      );
      break;
    }
    default:
      return undefined;
  }
  if (built == null) return undefined;
  return {
    entityId: spec.entityId,
    variableId: spec.variableId,
    functionName: FILTER_DEFINED_GROUPS,
    displayName: spec.displayName,
    config: { groups: built, ...withUnmapped(unmappedValue) },
  };
}

export interface DecodedDerivedVariable {
  /** What is saved and sent to the server. */
  stored: DerivedVariableSpec;
  /** What the editor works with. */
  editable: FilterDefinedGroupsSpec;
}

/**
 * Splits specs into those this client can work with and those it cannot
 * (unknown plugin, or a config it cannot decode or represent). Unsupported
 * specs must be preserved untouched, never dropped or fatal.
 */
export function decodeDerivedVariables(entries: DerivedVariableSpec[]): {
  supported: DecodedDerivedVariable[];
  unsupported: DerivedVariableSpec[];
} {
  const supported: DecodedDerivedVariable[] = [];
  const unsupported: DerivedVariableSpec[] = [];
  for (const entry of entries) {
    if (isFilterDefinedGroupsSpec(entry)) {
      supported.push({ stored: entry, editable: entry });
      continue;
    }
    const editable = fromRecoderSpec(entry);
    if (editable != null) supported.push({ stored: entry, editable });
    else unsupported.push(entry);
  }
  return { supported, unsupported };
}
