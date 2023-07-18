// Typescript types for attribute filter

// Field types
// -----------

interface BaseField {
  type?: string;
  term: string;
  display: string;
  parent?: string;
  isRange?: boolean;
}

export interface StringMemberField extends BaseField {
  type: 'string';
  isRange: false;
}

export interface NumberMemberField extends BaseField {
  type: 'number';
  isRange: false;
}

export interface DateMemberField extends BaseField {
  type: 'date';
  isRange: false;
}

export interface NumberRangeField extends BaseField {
  type: 'number';
  isRange: true;
}

export interface DateRangeField extends BaseField {
  type: 'date';
  isRange: true;
}

export interface MultiField extends BaseField {
  type: 'multiFilter';
}

export type MemberField =
  | StringMemberField
  | NumberMemberField
  | DateMemberField;
export type RangeField = NumberRangeField | DateRangeField;
export type FilterField = MemberField | RangeField | MultiField;
export type Field = FilterField | BaseField;

export type TreeNode<T extends Field> = {
  field: T;
  children: TreeNode<T>[];
};
export type FieldTreeNode = TreeNode<Field>;

// Filter value types
// ------------------

export type MemberValue<T> = Array<T | null>;
export type RangeValue<T> = { min?: T; max?: T };
export type MultiFilterValue = {
  operation: 'union' | 'intersect';
  filters: MemberFilter[];
};

export type FilterValue<T extends FilterField> = T extends MultiField
  ? MultiFilterValue
  : T extends NumberRangeField
  ? RangeValue<number>
  : T extends DateRangeField
  ? RangeValue<string>
  : T extends MemberField
  ? MemberValue<T>
  : never;

// Filter type
// -----------

interface BaseFilter {
  field: string;
  isRange: boolean;
  includeUnknown: boolean;
  type: string;
  value: any;
}

export interface StringMemberFilter extends BaseFilter {
  type: 'string';
  isRange: false;
  value: MemberValue<string>;
}

export interface NumberMemberFilter extends BaseFilter {
  type: 'number';
  isRange: false;
  value: MemberValue<number>;
}

export interface DateMemberFilter extends BaseFilter {
  type: 'date';
  isRange: false;
  value: MemberValue<string>;
}

export interface NumberRangeFilter extends BaseFilter {
  type: 'number';
  isRange: true;
  value: RangeValue<number>;
}

export interface LongitudeRangeFilter extends BaseFilter {
  type: 'longitude';
  isRange: true;
  value: RangeValue<number>;
}

export interface DateRangeFilter extends BaseFilter {
  type: 'date';
  isRange: true;
  value: RangeValue<string>;
}

export interface MultiFilter extends BaseFilter {
  type: 'multiFilter';
  value: MultiFilterValue;
  isRange: false;
}

export type MemberFilter =
  | StringMemberFilter
  | NumberMemberFilter
  | DateMemberFilter;
export type RangeFilter =
  | NumberRangeFilter
  | DateRangeFilter
  | LongitudeRangeFilter;

export type Filter = MemberFilter | RangeFilter | MultiFilter;

export type FilterWithFieldDisplayName = Filter & { fieldDisplayName?: string };

export type ValueCounts = Array<{
  value: string | number | null;
  count: number;
  filteredCount: number;
}>;

export type OntologyTermSummary = {
  valueCounts: ValueCounts;
  internalsCount: number;
  internalsFilteredCount: number;
};
