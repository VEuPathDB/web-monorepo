import React, { useMemo } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { orderBy } from 'lodash';

import { CollapsibleSection } from 'wdk-client/Components';
import { AttributeField, AttributeValue } from 'wdk-client/Utils/WdkModel';

import { PfamDomain } from '../components/pfam-domains/PfamDomain';
import { RecordAttributeSectionProps, RecordTableProps,  WrappedComponentProps } from './Types';

import './GroupRecordClasses.GroupRecordClass.scss';

const MSA_ATTRIBUTE_NAME = 'msa';

const PFAMS_TABLE_NAME = 'PFams';
const PROTEIN_PFAMS_TABLE_NAME = 'ProteinPFams';

const ACCESSION_NUMBER_ATTRIBUTE_NAME = 'accession';
const CORE_PERIPHERAL_NAME = 'core_peripheral';
const DOMAIN_START_ATTRIBUTE_NAME = 'start_min';
const DOMAIN_END_ATTRIBUTE_NAME = 'end_max';
const PROTEIN_LENGTH_ATTRIBUTE_NAME = 'protein_length';
const SOURCE_ID_ATTRIBUTE_NAME = 'full_id';

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
  [PFAMS_TABLE_NAME]: afs => transformPfamsAttributeFields(true, afs),
  [PROTEIN_PFAMS_TABLE_NAME]: afs => transformProteinPfamsAttributeFields(
    [
      {
        name: SOURCE_ID_ATTRIBUTE_NAME,
        displayName: 'Accession'
      },
      {
        name: PROTEIN_LENGTH_ATTRIBUTE_NAME,
        displayName: 'Protein Length'
      },
      {
        name: ACCESSION_NUMBER_ATTRIBUTE_NAME,
        displayName: 'Pfam Domain'
      },
      {
        name: DOMAIN_START_ATTRIBUTE_NAME,
        displayName: 'Domain Start'
      },
      {
        name: DOMAIN_END_ATTRIBUTE_NAME,
        displayName: 'Domain End'
      }
    ],
    afs
  )
};

const tableRowTransforms: Record<string, (row: Record<string, AttributeValue>) => Record<string, AttributeValue>> = {
  [PFAMS_TABLE_NAME]: row => transformPfamsTableRow(true, row),
  [PROTEIN_PFAMS_TABLE_NAME]: row => transformProteinPfamsTableRow(true, row)
};

function transformPfamsAttributeFields(
  isGraphic: boolean,
  attributeFields: AttributeField[]
): AttributeField[] {
  const renamedAttributeFields = attributeFields.map(
    attributeField => attributeField.name === ACCESSION_NUMBER_ATTRIBUTE_NAME
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
  const accessionValue = row[ACCESSION_NUMBER_ATTRIBUTE_NAME];

  // The accession value should be rendered as a link, and if
  // the table is in "graphic" mode, a value for the "legend" column should
  // be provided
  return {
    ...row,
    [ACCESSION_NUMBER_ATTRIBUTE_NAME]: typeof accessionValue === 'string'
      ? { url: `http://pfam.xfam.org/family/${accessionValue}`, displayText: accessionValue }
      : accessionValue,
    legend: isGraphic && typeof accessionValue === 'string'
      ? renderToStaticMarkup(<PfamDomain pfamId={accessionValue} />)
      : null
  };
}

interface PseudoAttributeSpec {
  name: string;
  displayName: string;
}

function transformProteinPfamsAttributeFields(
  pseudoAttributeSpecs: PseudoAttributeSpec[],
  attributeFields: AttributeField[]
): AttributeField[] {
  const filteredAttributeFields = attributeFields.filter(
    attributeField => pseudoAttributeSpecs.find(pa => pa.name === attributeField.name)
  );

  const attributeDisplayNames = new Map(pseudoAttributeSpecs.map(pa => [pa.name, pa.displayName]));

  const renamedAttributeFields = filteredAttributeFields.map(
    attributeField =>
      ({
        ...attributeField,
        displayName: attributeDisplayNames.get(attributeField.name) ?? attributeField.name
      })
  );

  const reorderedAttributeFields = orderBy(
    renamedAttributeFields,
    attributeField => pseudoAttributeSpecs.findIndex(pa => pa.name === attributeField.name)
  );

  return reorderedAttributeFields;
}

function transformProteinPfamsTableRow(
  isGraphic: boolean = true,
  row: Record<string, AttributeValue>
): Record<string, AttributeValue> {
  const accessionValue = row[SOURCE_ID_ATTRIBUTE_NAME];

  return {
    ...row,
    [SOURCE_ID_ATTRIBUTE_NAME]: typeof accessionValue === 'string'
      ? { url: `/a/app/record/sequence/${accessionValue}`, displayText: accessionValue }
      : accessionValue,
  };
}
