import React, { useMemo } from 'react';

import { AttributeValue } from 'wdk-client/Utils/WdkModel';

import { PfamDomainArchitecture } from '../components/pfam-domains/PfamDomainArchitecture';

import {
  DOMAIN_END_ATTRIBUTE_NAME,
  DOMAIN_START_ATTRIBUTE_NAME,
  PFAM_LEGEND_ATTRIBUTE_FIELD,
  makeCommonRecordTableWrapper,
  makeDomainAccessionLink,
  transformAttributeFieldsUsingSpecs,
  makePfamLegendMarkup,
  extractPfamDomain
} from './utils';

import { RecordTableProps, WrappedComponentProps } from './Types';

import './SequenceRecordClasses.SequenceRecordClass.scss';

const PFAM_DOMAINS_TABLE_NAME = 'PFamDomains';

const DOMAIN_ACCESSION_ATTRIBUTE_NAME = 'accession';
const DOMAIN_LENGTH_ATTRIBUTE_NAME = 'length';
const DOMAIN_DESCRIPTION_ATTRIBUTE_NAME = 'description';
const DOMAIN_SYMBOL_ATTRIBUTE_NAME = 'symbol';

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

function makePfamDomainsTableRow(row: Record<string, AttributeValue>) {
  const accessionValue = row[DOMAIN_ACCESSION_ATTRIBUTE_NAME];

  return {
    ...row,
    [DOMAIN_ACCESSION_ATTRIBUTE_NAME]: typeof accessionValue === 'string'
      ? makeDomainAccessionLink(accessionValue)
      : accessionValue,
    [PFAM_LEGEND_ATTRIBUTE_FIELD.name]: typeof accessionValue === 'string'
      ? makePfamLegendMarkup(accessionValue)
      : accessionValue
  };
}

const PfamDomainsTable = makeCommonRecordTableWrapper(
  makePfamDomainsAttributeFields,
  makePfamDomainsTableRow
);

function RecordTable_PfamDomains(props: WrappedComponentProps<RecordTableProps>) {
  const length = Number(props.record.attributes[DOMAIN_LENGTH_ATTRIBUTE_NAME]);

  const domains = useMemo(
    () => props.value.flatMap(extractPfamDomain),
    [ props.value ]
  );

  return (
    <div className="PfamDomainsContent">
      <div className="DomainArchitectureHeader">
        Domain Architecture
      </div>
      <PfamDomainArchitecture
        length={length}
        domains={domains}
      />
      <PfamDomainsTable {...props} />
    </div>
  )
}

const recordTableWrappers: Record<string, React.ComponentType<WrappedComponentProps<RecordTableProps>>> = {
  [PFAM_DOMAINS_TABLE_NAME]: RecordTable_PfamDomains
};
