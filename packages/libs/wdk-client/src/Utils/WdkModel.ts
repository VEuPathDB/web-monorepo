/**
 * Type definitions for WDK Model entities
 */

import { Field, OntologyTermSummary } from '../Components/AttributeFilter/Types';

interface ModelEntity {
  name: string;
  displayName: string;
  properties?: Record<string, string[]>;
}

export interface RecordClass extends ModelEntity {
  displayNamePlural: string;
  recordIdAttributeName: string;
  primaryKeyColumnRefs: string[];
  description: string;
  urlSegment: string;
  attributes: AttributeField[];
  tables: TableField[];
  attributesMap: Record<string, AttributeField>;
  tablesMap: Record<string, TableField>;
  formats: Reporter[];
  useBasket: boolean;
}

export interface Reporter {
  name: string;
  type: string;
  displayName: string;
  description: string;
  isInReport: boolean;
  scopes: string[];
}

export interface ParameterBase extends ModelEntity {
  help: string;
  isVisible: boolean;
  group: string;
  isReadOnly: boolean;
  defaultValue?: ParameterValue;
  dependentParams: string[];
}

export interface StringParam extends ParameterBase {
  type: 'StringParam';
  length: number;
}

export interface AnswerParam extends ParameterBase {
  type: 'AnswerParam';
}

export interface TimestampParam extends ParameterBase {
  type: 'TimestampParam';
}

export interface FilterParamNew extends ParameterBase {
  type: 'FilterParamNew';
  filterDataTypeDisplayName?: string;
  minSelectedCount: number;
  ontology: Array<{
    term: string;
    parent?: string;
    display: string;
    description?: string;
    type?: 'date' | 'string' | 'number' | 'multiFilter';
    // units: string;
    precision: number;
    isRange: boolean;
  }>;
  values: Record<string, string[]>;
}

export interface EnumParamBase extends ParameterBase {
  type: 'EnumParam' | 'FlatVocabParam';
  displayType: string;
  countOnlyLeaves: boolean;
  maxSelectedCount: number;
  minSelectedCount: number;
  multiPick: boolean;
  depthExpanded: number;
}

type VocabTerm = string;
type VocabDisplay = string;
type VocabParent = string;

export interface SelectEnumParam extends EnumParamBase {
  displayType: 'select';
  vocabulary: [ VocabTerm, VocabDisplay, null ][];
}

export interface CheckboxEnumParam extends EnumParamBase {
  displayType: 'checkBox';
  vocabulary: [ VocabTerm, VocabDisplay, null ][];
}

export interface TypeAheadEnumParam extends EnumParamBase {
  displayType: 'typeAhead';
  vocabulary: [ VocabTerm, VocabDisplay, null ][];
}

// FIXME Remove
export interface ListEnumParam extends EnumParamBase {
  displayType: 'select' | 'checkBox' | 'typeAhead';
  vocabulary: [ VocabTerm, VocabDisplay, VocabParent | null ][];
}

export interface TreeBoxVocabNode {
  data: {
    term: string;
    display: string;
  };
  children: TreeBoxVocabNode[]
}

export interface TreeBoxEnumParam extends EnumParamBase {
  displayType: 'treeBox';
  vocabulary: TreeBoxVocabNode;
}

export type EnumParam = SelectEnumParam | CheckboxEnumParam | TypeAheadEnumParam | TreeBoxEnumParam;

export interface NumberParam extends ParameterBase {
  type: 'NumberParam';
  min: number;
  max: number;
  step: number;
}

export interface NumberRangeParam extends ParameterBase {
  type: 'NumberRangeParam';
  min: number;
  max: number;
  step: number;
}

export interface DateParam extends ParameterBase {
  type: 'DateParam';
  minDate: string;
  maxDate: string;
}

export interface DateRangeParam extends ParameterBase {
  type: 'DateRangeParam';
  minDate: string;
  maxDate: string;
}

export interface DatasetParam extends ParameterBase {
  type: 'DatasetParam';
  defaultIdList?: string;
  parsers: { name: string; displayName: string; description: string; }[]
}

export type Parameter = AnswerParam
                      | DatasetParam
                      | DateParam
                      | DateRangeParam
                      | EnumParam
                      | FilterParamNew
                      | NumberParam
                      | NumberRangeParam
                      | StringParam
                      | TimestampParam;

export interface ParameterGroup {
  description: string;
  displayName: string;
  displayType: string; // this should be a union of string literals
  isVisible: boolean;
  name: string;
  parameters: string[];
}

interface QuestionShared extends ModelEntity {
  summary?: string;
  description?: string;
  shortDisplayName: string;
  recordClassName: string;
  help?: string;
  newBuild?: string;
  reviseBuild?: string;
  urlSegment: string;
  groups: ParameterGroup[];
  defaultAttributes: string[];
  dynamicAttributes: AttributeField[];
  defaultSummaryView: string;
  summaryViewPlugins: string[];
  stepAnalysisPlugins: string[];
}

export interface Question extends QuestionShared {
  parameters: string[];
}

export interface QuestionWithParameters extends QuestionShared {
  parameters: Parameter[];
}

export type ParameterValue = string;

export type ParameterValues = Record<string, ParameterValue>;

export type SortSpec = {
  groupBySelected: boolean;
  columnKey: string;
  direction: string;
};

export type FieldState = {
  sort: SortSpec;
}

export type ParamUIState = { } | {
  errorMessage?: string;
  loading: boolean;
  activeOntologyTerm?: string;
  hideFilterPanel: boolean;
  hideFieldPanel: boolean;
  ontologyTermSummaries: Record<string, OntologyTermSummary>;
  defaultMemberFieldState: FieldState;
  fieldStates: Record<string, FieldState>;
  ontology: Field[];
  filteredCount?: number;
  unfilteredCount?: number;
}

export interface AttributeField extends ModelEntity {
  help?: string;
  align?: string;
  isSortable: boolean;
  isRemovable: boolean;
  isDisplayable: boolean;
  type?: string;
  truncateTo: number;
  formats: Reporter[];
}

export interface TableField extends ModelEntity {
  help: string;
  type: string;
  description: string;
  attributes: AttributeField[];
}

export interface RecordInstance {
  displayName: string;
  id: PrimaryKey;
  recordClassName: string;
  attributes: Record<string, AttributeValue>;
  tables: Record<string, TableValue>;
  tableErrors: string[];
}

export interface PrimaryKey extends Array<{
  name: string;
  value: string;
}> {}

export type AttributeValue = string | LinkAttributeValue | null;

export interface LinkAttributeValue {
  url: string;
  displayText?: string;
}

export interface TableValue extends Array<Record<string, AttributeValue>> { }

export interface Answer {
  records: RecordInstance[];
  meta: {
    attributes: string[];
    tables: string[];
    recordClassName: string;
    responseCount: number;
    totalCount: number;
  }
}

export interface AnswerSpec {
  questionName: string;
  parameters?: Record<string, string>;
  legacyFilterName?: string;
  filters?: { name: string; value: string; }[];
  viewFilters?: { name: string; value: string; }[];
  wdk_weight?: number;
}

export interface AnswerFormatting {
  format: string
  formatConfig?: object
}

export interface NewStepSpec {
  answerSpec: AnswerSpec,
  customName?: string,
  isCollapsible?: boolean,
  collapsedName?: string
}

export type UserDatasetMeta = {
  description: string;
  name: string;
  summary: string;
};

export type UserDatasetShare = {
  time: number;
  user: number;
  email: string;
  userDisplayName: string;
};

export type UserDataset = {
  created: number;
  age: number;
  isInstalled: boolean;
  isCompatible: boolean;
  dependencies: Array<{
    resourceDisplayName: string;
    resourceIdentifier: string;
    resourceVersion: string;
  }>;
  datafiles: Array<{
    name: string;
    size: number;
  }>;
  projects: string[];
  id: number;
  meta: UserDatasetMeta;
  modified: number;
  owner: string;
  ownerUserId: number;
  percentQuotaUsed: number;
  sharedWith: UserDatasetShare[] | undefined;
  questions: string[];
  size: number;
  type: {
    name: string;
    display: string;
    version: string;
  };
  updloaded: number;
}

export type Favorite = {
  id: number;
  recordClassName: string;
  primaryKey: PrimaryKey;
  displayName: string;
  description: string;
  group: string;
}

export function getSingleRecordQuestionName(recordClassName: string): string {
  return `__${recordClassName}__singleRecordQuestion__`;
}

export function getSingleRecordAnswerSpec(record: RecordInstance): AnswerSpec {
  return {
    questionName: getSingleRecordQuestionName(record.recordClassName),
    parameters: {
      "primaryKeys": record.id.map(pkCol => pkCol.value).join(",")
    }
  };
}
