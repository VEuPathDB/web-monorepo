import React from 'react';

import { requestPartialRecord } from '@veupathdb/wdk-client/lib/Actions/RecordActions';
import { CategoryTreeNode } from '@veupathdb/wdk-client/lib/Utils/CategoryUtils';
import {
  AttributeField,
  RecordInstance,
  RecordClass,
  TableField,
  TableValue,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';

export type WrappedComponentProps<T> = T & {
  DefaultComponent: React.ComponentType<T>;
};

export interface RecordAttributeProps {
  attribute: AttributeField;
  record: RecordInstance;
  recordClass: RecordClass;
}

export interface RecordTableProps {
  className?: string;
  record: RecordInstance;
  recordClass: RecordClass;
  table: TableField;
  value: TableValue;
}
