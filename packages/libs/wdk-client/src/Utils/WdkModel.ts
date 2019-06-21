/**
 * Type definitions for WDK Model entities
 */

import { Field, OntologyTermSummary } from 'wdk-client/Components/AttributeFilter/Types';
import { StepAnalysisType } from 'wdk-client/Utils/StepAnalysisUtils';

interface ModelEntity {
  displayName: string;
  properties?: Record<string, string[]>;
}

export interface Identifier {
  id: number
}

interface NamedModelEntity extends ModelEntity {
  name: string
}

interface UrlModelEntity extends ModelEntity {
  fullName: string,
  urlSegment: string
}

export interface RecordClass extends UrlModelEntity {
  displayNamePlural: string;
  shortDisplayName: string;
  shortDisplayNamePlural: string;
  iconName?: string;
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
  searches: Array<Question>
}

export interface Reporter {
  name: string;
  type: string;
  displayName: string;
  description: string;
  isInReport: boolean;
  scopes: string[];
}

export interface ParameterBase extends NamedModelEntity {
  help: string;
  isVisible: boolean;
  group: string;
  isReadOnly: boolean;
  initialDisplayValue?: ParameterValue;
  dependentParams: string[];
}

export interface StringParam extends ParameterBase {
  type: 'string';
  length: number;
}

export interface TimestampParam extends ParameterBase {
  type: 'timestamp';
}

export interface FilterParamNew extends ParameterBase {
  type: 'filter';
  filterDataTypeDisplayName?: string;
  minSelectedCount: number;
  hideEmptyOntologyNodes?: boolean;
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
  type: 'vocabulary';
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
  type: 'number';
  min: number;
  max: number;
  increment: number;
}

export interface NumberRangeParam extends ParameterBase {
  type: 'number-range';
  min: number;
  max: number;
  increment: number;
}

export interface DateParam extends ParameterBase {
  type: 'date';
  minDate: string;
  maxDate: string;
}

export interface DateRangeParam extends ParameterBase {
  type: 'date-range';
  minDate: string;
  maxDate: string;
}

export interface DatasetParam extends ParameterBase {
  type: 'input-dataset';
  defaultIdList?: string;
  parsers: { name: string; displayName: string; description: string; }[]
}

export type Parameter =
  | StringParam
  | TimestampParam
  | DatasetParam
  | DateParam
  | DateRangeParam
  | EnumParam
  | FilterParamNew
  | NumberParam
  | NumberRangeParam

export interface ParameterGroup {
  description: string;
  displayName: string;
  displayType: string; // this should be a union of string literals
  isVisible: boolean;
  name: string;
  parameters: string[];
}

interface QuestionFilter {
  name: string;
  displayName?: string;
  description?: string;
  isViewOnly: boolean;
}

interface QuestionShared extends UrlModelEntity {
  summary?: string;
  description?: string;
  iconName?: string;
  shortDisplayName: string;
  outputRecordClassName: string;
  help?: string;
  newBuild?: string;
  reviseBuild?: string;
  urlSegment: string;
  groups: ParameterGroup[];
  defaultAttributes: string[];
  defaultSorting: AttributeSortingSpec[];
  dynamicAttributes: AttributeField[];
  defaultSummaryView: string;
  summaryViewPlugins: SummaryViewPluginField[];
  stepAnalysisPlugins: StepAnalysisType[];
  filters: QuestionFilter[];
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

export interface AttributeField extends NamedModelEntity {
  help?: string;
  align?: string;
  isSortable: boolean;
  isRemovable: boolean;
  isDisplayable: boolean;
  type?: string;
  truncateTo: number;
  formats: Reporter[];
}

export interface SummaryViewPluginField extends NamedModelEntity {
  description: string;
}

export interface TableField extends NamedModelEntity {
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
    viewTotalCount: number;
    displayTotalCount: number;
    displayViewTotalCount: number;
    sorting: AttributeSortingSpec[];
    pagination: Pagination;
  }
}

export interface SearchConfig {
  parameters: Record<string, string>;
  legacyFilterName?: string;
  filters?: FilterValueArray;
  viewFilters?: FilterValueArray;
  wdkWeight?: number;
}

export type FilterValueArray = {
  name: string;
  value: any;
}[];

export interface AnswerSpec {
  searchName: string;
  searchConfig: SearchConfig;
}

export interface StandardReportConfig extends AttributesConfig {
  pagination?: Pagination;
  tables?: string[] | '__ALL_TABLES__';
  attachmentType?: string;
  includeEmptyTables?: boolean;
}

export interface AttributeSortingSpec {
  attributeName: string;
  direction: 'ASC' | 'DESC';
}

export interface AttributesConfig {
  attributes?: string[] | '__ALL_ATTRIBUTES__';
  sorting?: AttributeSortingSpec[];
}

export interface Pagination { offset: number, numRecords: number };

export interface AnswerJsonFormatConfig extends AttributesConfig {
  pagination?: Pagination;
  tables?: string[] | '__ALL_TABLES__';
  attachmentType?: string;
  includeEmptyTables?: boolean;
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

export interface BlastSummaryViewReport extends Answer {
  blastMeta: {
    blastHeader: string;
    blastMiddle: string;
    blastFooter: string;
  }
}

export interface IsolatesSummaryViewReport {
  maxLength: number;
  isolates: IsolateForSummaryView[];
}

export interface IsolateForSummaryView {
  country: string;
  gaz: string;
  type: string;
  total: number;
  lat: number;
  lng: number;
}

export interface GenomeSummaryViewReport {
  isTruncate?: boolean;
  isDetail: boolean;
  maxLength: number;
  sequences: GenomeViewSequence[];
}

export interface GenomeViewSequence {
  sourceId: string;
  regions: GenomeViewRegion[];
  features: GenomeViewFeature[];
  length: number;
  percentLength: number;
  chromosome: string;
  organism: string;
}

export interface GenomeViewRegion {
  isForward: boolean,
  percentStart: number,
  percentLength: number,
  features: GenomeViewFeature[];
}

export interface GenomeViewFeature {
  sourceId: string;
  isForward: boolean;
  sequenceId: string;
  start: number;
  end: number;
  percentStart: number;
  percentLength: number;
  context: string;
  description: string;
}

export function getSingleRecordQuestionName(recordClassName: string): string {
  return `__${recordClassName}__singleRecordQuestion__`;
}

export function getSingleRecordAnswerSpec(record: RecordInstance): AnswerSpec {
  return {
    searchName: getSingleRecordQuestionName(record.recordClassName),
    searchConfig: {
      parameters: {
        "primaryKeys": record.id.map(pkCol => pkCol.value).join(",")
      }
    }
  };
}
