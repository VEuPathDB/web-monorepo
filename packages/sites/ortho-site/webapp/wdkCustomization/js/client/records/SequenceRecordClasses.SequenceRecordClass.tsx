import React, { useMemo } from 'react';

import { RecordTableProps, WrappedComponentProps } from './Types';

import './SequenceRecordClasses.SequenceRecordClass.scss';
import { makeCommonRecordTableWrapper, transformAttributeFieldsUsingSpecs, PFAM_LEGEND_ATTRIBUTE_FIELD } from './utils';

const PFAM_DOMAINS_TABLE_NAME = 'PFamDomains';

const DOMAIN_ACCESSION_ATTRIBUTE_NAME = 'accession';
const DOMAIN_SYMBOL_ATTRIBUTE_NAME = 'symbol';
const DOMAIN_DESCRIPTION_ATTRIBUTE_NAME = 'description';
const DOMAIN_START_ATTRIBUTE_NAME = 'start_min';
const DOMAIN_END_ATTRIBUTE_NAME = 'end_max';

export function RecordTable(props: WrappedComponentProps<RecordTableProps>) {
  const Component = recordTableWrappers[props.table.name] ?? props.DefaultComponent;

  return <Component {...props} />;
}

const makePfamDomainsAttributeFields = transformAttributeFieldsUsingSpecs([
  {
    name: DOMAIN_ACCESSION_ATTRIBUTE_NAME,
    displayName: 'Accession'
  },
  {
    name: DOMAIN_SYMBOL_ATTRIBUTE_NAME,
    displayName: 'Name'
  },
  {
    name: DOMAIN_DESCRIPTION_ATTRIBUTE_NAME,
    displayName: 'Description'
  },
  {
    name: DOMAIN_START_ATTRIBUTE_NAME,
    displayName: 'Start'
  },
  {
    name: DOMAIN_END_ATTRIBUTE_NAME,
    displayName: 'End'
  },
  PFAM_LEGEND_ATTRIBUTE_FIELD
]);

const RecordTable_PfamDomains = makeCommonRecordTableWrapper(
  makePfamDomainsAttributeFields,
  table => table
);

const recordTableWrappers: Record<string, React.ComponentType<WrappedComponentProps<RecordTableProps>>> = {
  [PFAM_DOMAINS_TABLE_NAME]: RecordTable_PfamDomains
};
