import React, { useMemo } from 'react';

import { RecordTableProps, WrappedComponentProps } from './Types';

import './SequenceRecordClasses.SequenceRecordClass.scss';

const PFAM_DOMAINS_TABLE_NAME = 'PFamDomains';

export function RecordTable(props: WrappedComponentProps<RecordTableProps>) {
  const Component = recordTableWrappers[props.table.name] ?? props.DefaultComponent;

  return <Component {...props} />;
}

function RecordTable_PfamDomains(props: WrappedComponentProps<RecordTableProps>) {
  return <props.DefaultComponent {...props} />;
}

const recordTableWrappers: Record<string, React.ComponentType<WrappedComponentProps<RecordTableProps>>> = {
  [PFAM_DOMAINS_TABLE_NAME]: RecordTable_PfamDomains
};
