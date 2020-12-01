import * as t from '@veupathdb/wdk-client/lib/Utils/Json';
import { Filter } from './filter';

export type DerviedVariable = t.Unpack<typeof DerviedVariable>;
export const DerviedVariable = t.unknown;

export type VariableUISetting = t.Unpack<typeof VariableUISetting>;
export const VariableUISetting = t.unknown;

export type Visualization = t.Unpack<typeof Visualization>;
export const Visualization = t.unknown;

export type NewAnalysis = t.Unpack<typeof NewAnalysis>;
export const NewAnalysis = t.record({
  name: t.string,
  studyId: t.string,
  filters: t.arrayOf(Filter),
  derivedVariables: t.arrayOf(DerviedVariable),
  starredVariables: t.arrayOf(t.string),
  variableUISettings: t.objectOf(VariableUISetting),
  visualizations: t.arrayOf(Visualization)
})

export type Analysis = t.Unpack<typeof Analysis>;
export const Analysis = t.combine(NewAnalysis, t.record({
  id: t.string,
  created: t.string,
  modified: t.string
}));
