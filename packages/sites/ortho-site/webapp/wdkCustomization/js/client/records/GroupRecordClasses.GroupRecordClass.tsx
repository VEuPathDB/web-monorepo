import React, { useMemo } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { CollapsibleSection } from 'wdk-client/Components';
import { AttributeField, AttributeValue } from 'wdk-client/Utils/WdkModel';

import { PfamDomain } from '../components/pfam-domains/PfamDomain';
import { RecordAttributeSectionProps, RecordTableProps,  WrappedComponentProps } from './Types';

import './GroupRecordClasses.GroupRecordClass.scss';

const MSA_ATTRIBUTE_NAME = 'msa';
const PFAMS_TABLE_NAME = 'PFams';
const PFAMS_ACCESSION_NUMBER_ATTRIBUTE_NAME = 'accession';

const PFAM_LEGEND_ATTRIBUTE_FIELD: AttributeField = {
  name: 'legend',
  displayName: 'Legend',
  isDisplayable: true,
  isSortable: false,
  isRemovable: false,
  truncateTo: 100,
  formats: []
};

export function RecordAttributeSection(props: WrappedComponentProps<RecordAttributeSectionProps>) {
  return props.attribute.name === MSA_ATTRIBUTE_NAME
    ? <MsaAttributeSection {...props} />
    : <props.DefaultComponent {...props} />;
}

function MsaAttributeSection(props: RecordAttributeSectionProps) {
  const { isCollapsed, onCollapsedChange } = props;
  const { name: attributeName, displayName: attributeDisplayName } = props.attribute;

  const msaValue = props.record.attributes[attributeName];

  return (
    <CollapsibleSection
      id={attributeName}
      className="wdk-RecordAttributeSectionItem"
      headerContent={attributeDisplayName}
      isCollapsed={isCollapsed}
      onCollapsedChange={onCollapsedChange}
    >
      {
        typeof msaValue !== 'string'
          ? <div className="wdk-MissingMsaAttribute">
              We're sorry, multiple sequence alignments are only available for groups with 100 or fewer sequences.
            </div>
          : <pre>
              {msaValue}
            </pre>
      }
    </CollapsibleSection>
  );
}


export function RecordTable(props: WrappedComponentProps<RecordTableProps>) {
  const transformedTable = useMemo(
    () => props.table.name in attributeFieldTransforms
      ? {
          ...props.table,
          attributes: attributeFieldTransforms[props.table.name](props.table.attributes)
        }
      : props.table,
    [ props.table ]
  );

  const transformedValue = useMemo(
    () => props.table.name in tableRowTransforms
      ? props.value.map(tableRowTransforms[props.table.name])
      : props.value,
    [ props.value, props.table.name ]
  );

  return <props.DefaultComponent {...props} table={transformedTable} value={transformedValue} />;
}

const attributeFieldTransforms: Record<string, (afs: AttributeField[]) => AttributeField[]> = {
  [PFAMS_TABLE_NAME]: afs => transformPfamsAttributeFields(true, afs)
};

const tableRowTransforms: Record<string, (row: Record<string, AttributeValue>) => Record<string, AttributeValue>> = {
  [PFAMS_TABLE_NAME]: row => transformPfamsTableRow(true, row)
};

function transformPfamsAttributeFields(
  isGraphic: boolean,
  attributeFields: AttributeField[]
): AttributeField[] {
  const renamedAttributeFields = attributeFields.map(
    attributeField => attributeField.name === PFAMS_ACCESSION_NUMBER_ATTRIBUTE_NAME
      ? { ...attributeField, displayName: 'Accession' }
      : attributeField
  );

  return isGraphic
    ? [...renamedAttributeFields, PFAM_LEGEND_ATTRIBUTE_FIELD]
    : renamedAttributeFields;
}

function transformPfamsTableRow(
  isGraphic: boolean = true,
  row: Record<string, AttributeValue>
): Record<string, AttributeValue> {
  const accessionValue = row[PFAMS_ACCESSION_NUMBER_ATTRIBUTE_NAME];

  // The accession value should be rendered as a link, and if
  // the table is in "graphic" mode, a value for the "legend" column should
  // be provided
  return {
    ...row,
    [PFAMS_ACCESSION_NUMBER_ATTRIBUTE_NAME]: typeof accessionValue === 'string'
      ? { url: `http://pfam.xfam.org/family/${accessionValue}`, displayText: accessionValue }
      : accessionValue,
    legend: isGraphic && typeof accessionValue === 'string'
      ? renderToStaticMarkup(<PfamDomain pfamId={accessionValue} />)
      : null
  };
}
