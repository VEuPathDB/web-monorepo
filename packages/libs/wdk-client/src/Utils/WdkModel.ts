/**
 * Type definitions for WDK Model entities
 */

import {
  Field,
  OntologyTermSummary,
} from '../Components/AttributeFilter/Types';

export interface ModelEntity {
  displayName: string;
  properties?: Record<string, string[]>;
}

export interface Identifier {
  id: number;
}

export interface NamedModelEntity extends ModelEntity {
  name: string;
}

export interface UrlModelEntity extends ModelEntity {
  fullName: string;
  urlSegment: string;
}

export interface RecordClass extends UrlModelEntity {
  displayNamePlural: string;
  shortDisplayName: string;
  shortDisplayNamePlural: string;
  iconName?: string;
  recordIdAttributeName: string;
  primaryKeyColumnRefs: string[];
  description: string;
  attributes: AttributeField[];
  tables: TableField[];
  attributesMap: Record<string, AttributeField>;
  tablesMap: Record<string, TableField>;
  formats: Reporter[];
  useBasket: boolean;
  searches: Array<Question>;
}

export interface Reporter {
  name: string;
  type: string;
  displayName: string;
  description?: string;
  isInReport: boolean;
  scopes: string[];
}

interface ParameterBase extends NamedModelEntity {
  help: string;
  isVisible: boolean;
  group: string;
  isReadOnly: boolean;
  initialDisplayValue?: ParameterValue;
  dependentParams: string[];
  allowEmptyValue: boolean;
  visibleHelp?: string;
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
  sortLeavesBeforeBranches?: boolean;
  hideGlobalCounts?: boolean;
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

interface AbstractEnumParamBase extends ParameterBase {
  displayType: string;
  maxSelectedCount: number;
  minSelectedCount: number;
}

type VocabTerm = string;
type VocabDisplay = string;
type VocabParent = string;

interface StandardEnumParamBase extends AbstractEnumParamBase {
  vocabulary: [VocabTerm, VocabDisplay, null][];
}

export interface TreeBoxVocabNode {
  data: {
    term: string;
    display: string;
  };
  children: TreeBoxVocabNode[];
}

interface TreeBoxEnumParamBase extends AbstractEnumParamBase {
  displayType: 'treeBox';
  depthExpanded: number;
  countOnlyLeaves: boolean;
  vocabulary: TreeBoxVocabNode;
}

// simple interfaces to declare individual types, displayTypes
interface SelectEnumParamBase extends StandardEnumParamBase {
  displayType: 'select';
}
interface CheckBoxEnumParamBase extends StandardEnumParamBase {
  displayType: 'checkBox';
}
interface TypeAheadEnumParamBase extends StandardEnumParamBase {
  displayType: 'typeAhead';
}
interface SinglePickEnumParam {
  type: 'single-pick-vocabulary';
}
interface MultiPickEnumParam {
  type: 'multi-pick-vocabulary';
}

// final types of all varieties of enum params
export interface SinglePickSelectEnumParam
  extends SelectEnumParamBase,
    SinglePickEnumParam {}
export interface MultiPickSelectEnumParam
  extends SelectEnumParamBase,
    MultiPickEnumParam {}
export interface SinglePickCheckBoxEnumParam
  extends CheckBoxEnumParamBase,
    SinglePickEnumParam {}
export interface MultiPickCheckBoxEnumParam
  extends CheckBoxEnumParamBase,
    MultiPickEnumParam {}
export interface SinglePickTypeAheadEnumParam
  extends TypeAheadEnumParamBase,
    SinglePickEnumParam {}
export interface MultiPickTypeAheadEnumParam
  extends TypeAheadEnumParamBase,
    MultiPickEnumParam {}
export interface SinglePickTreeBoxEnumParam
  extends TreeBoxEnumParamBase,
    SinglePickEnumParam {}
export interface MultiPickTreeBoxEnumParam
  extends TreeBoxEnumParamBase,
    MultiPickEnumParam {}

export type SelectEnumParam =
  | SinglePickSelectEnumParam
  | MultiPickSelectEnumParam;
export type CheckBoxEnumParam =
  | SinglePickCheckBoxEnumParam
  | MultiPickCheckBoxEnumParam;
export type TypeAheadEnumParam =
  | SinglePickTypeAheadEnumParam
  | MultiPickTypeAheadEnumParam;
export type TreeBoxEnumParam =
  | SinglePickTreeBoxEnumParam
  | MultiPickTreeBoxEnumParam;

export type EnumParam =
  | SelectEnumParam
  | CheckBoxEnumParam
  | TypeAheadEnumParam
  | TreeBoxEnumParam;

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
  parsers: { name: string; displayName: string; description: string }[];
}

export interface AnswerParam extends ParameterBase {
  type: 'input-step';
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
  | AnswerParam;

export interface ParameterGroup {
  description: string;
  displayName: string;
  displayType: string; // this should be a union of string literals
  isVisible: boolean;
  name: string;
  parameters: string[];
}

export interface QuestionFilter {
  name: string;
  displayName?: string;
  description?: string;
  isViewOnly: boolean;
}

export interface Question extends UrlModelEntity {
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
  noSummaryOnSingleRecord: boolean;
  summaryViewPlugins: SummaryViewPluginField[];
  filters: QuestionFilter[];
  allowedPrimaryInputRecordClassNames?: string[];
  allowedSecondaryInputRecordClassNames?: string[];
  isAnalyzable: boolean;
  paramNames: string[];
  queryName?: string;
  isCacheable: boolean;
  isBeta?: boolean;
}

export interface QuestionWithParameters extends Question {
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
};

export type ParamUIState =
  | {}
  | {
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
    };

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
  help?: string;
  type?: string;
  description?: string;
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

export interface PrimaryKey
  extends Array<{
    name: string;
    value: string;
  }> {}

export type AttributeValue = string | LinkAttributeValue | null;

export interface LinkAttributeValue {
  url: string;
  displayText?: string;
}

export interface TableValue extends Array<Record<string, AttributeValue>> {}

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
  };
}

export interface SearchConfig {
  parameters: ParameterValues;
  legacyFilterName?: string;
  filters?: FilterValueArray;
  columnFilters?: Record<string, Record<string, any>>;
  viewFilters?: FilterValueArray;
  wdkWeight?: number;
}

export type FilterValueArray = {
  name: string;
  value: any;
  disabled?: boolean;
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
  bufferEntireResponse?: boolean;
}

export interface AttributeSortingSpec {
  attributeName: string;
  direction: 'ASC' | 'DESC';
}

export interface AttributesConfig {
  attributes?: string[] | '__ALL_ATTRIBUTES__';
  sorting?: AttributeSortingSpec[];
}

export interface Pagination {
  offset: number;
  numRecords: number;
}

export interface AnswerJsonFormatConfig extends AttributesConfig {
  pagination?: Pagination;
  tables?: string[] | '__ALL_TABLES__';
  attachmentType?: string;
  includeEmptyTables?: boolean;
}

export type Favorite = {
  id: number;
  recordClassName: string;
  primaryKey: PrimaryKey;
  displayName: string;
  description: string;
  group: string;
};

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

export function getSingleRecordQuestionName(
  recordClassFullName: string
): string {
  let recordClassPortion = recordClassFullName.replace('.', '_');
  return `single_record_question_${recordClassPortion}`;
}

export function getSingleRecordAnswerSpec(record: RecordInstance): AnswerSpec {
  return {
    searchName: getSingleRecordQuestionName(record.recordClassName),
    searchConfig: {
      parameters: {
        primaryKeys: record.id.map((pkCol) => pkCol.value).join(','),
      },
    },
  };
}
