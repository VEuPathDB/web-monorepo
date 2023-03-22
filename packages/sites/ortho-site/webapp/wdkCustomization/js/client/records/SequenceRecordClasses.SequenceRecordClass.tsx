import React, { useMemo } from 'react';

import { CollapsibleSection, Link } from '@veupathdb/wdk-client/lib/Components';
import { AttributeValue } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { Props as RecordAttributeSectionProps } from '@veupathdb/wdk-client/lib/Views/Records/RecordAttributes/RecordAttributeSection';
import Sequence from '@veupathdb/web-common/lib/components/records/Sequence';

import { PfamDomainArchitecture } from 'ortho-client/components/pfam-domains/PfamDomainArchitecture';

import {
  DOMAIN_END_ATTRIBUTE_NAME,
  DOMAIN_START_ATTRIBUTE_NAME,
  PFAM_LEGEND_ATTRIBUTE_FIELD,
  makeCommonRecordTableWrapper,
  makeDomainAccessionLink,
  transformAttributeFieldsUsingSpecs,
  makePfamLegendMarkup,
  extractPfamDomain
} from 'ortho-client/records/utils';

import {
  RecordTableProps,
  WrappedComponentProps
} from 'ortho-client/records/Types';

import './SequenceRecordClasses.SequenceRecordClass.scss';

const SEQUENCE_TEXT_ATTRIBUTE_NAME = 'sequence';

const PFAM_DOMAINS_TABLE_NAME = 'PFamDomains';

const DOMAIN_ACCESSION_ATTRIBUTE_NAME = 'accession';
const DOMAIN_LENGTH_ATTRIBUTE_NAME = 'length';
const DOMAIN_DESCRIPTION_ATTRIBUTE_NAME = 'description';
const DOMAIN_SYMBOL_ATTRIBUTE_NAME = 'symbol';

export function RecordAttributeSection(props: WrappedComponentProps<RecordAttributeSectionProps>) {
  const Component = recordAttributeSectionWrappers[props.attribute.name] ?? props.DefaultComponent;

  return <Component {...props} />;
}

export function RecordTable(props: WrappedComponentProps<RecordTableProps>) {
  const Component = recordTableWrappers[props.table.name] ?? props.DefaultComponent;

  return <Component {...props} />;
}

function SequenceAttributeSection(props: RecordAttributeSectionProps) {
  const { isCollapsed, onCollapsedChange } = props;
  const { name: attributeName, displayName: attributeDisplayName } = props.attribute;

  const sequence = props.record.attributes[attributeName];

  return (
    <CollapsibleSection
      id={attributeName}
      className="wdk-RecordAttributeSectionItem"
      headerContent={attributeDisplayName}
      isCollapsed={isCollapsed}
      onCollapsedChange={onCollapsedChange}
    >
      {
        typeof sequence !== 'string'
          ? <div className="MissingAttribute">
              We cannot display the sequence for {props.recordClass.displayName} {props.record.displayName} at this time.
              If this problem persists, please <Link to="/contact-us" >contact us</Link>.
            </div>
          : <div className="SequenceAttribute">
              <Sequence sequence={sequence} />
            </div>
      }
    </CollapsibleSection>
  );
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

const recordAttributeSectionWrappers: Record<string, React.ComponentType<WrappedComponentProps<RecordAttributeSectionProps>>> = {
  [SEQUENCE_TEXT_ATTRIBUTE_NAME]: SequenceAttributeSection
};

const recordTableWrappers: Record<string, React.ComponentType<WrappedComponentProps<RecordTableProps>>> = {
  [PFAM_DOMAINS_TABLE_NAME]: RecordTable_PfamDomains
};
