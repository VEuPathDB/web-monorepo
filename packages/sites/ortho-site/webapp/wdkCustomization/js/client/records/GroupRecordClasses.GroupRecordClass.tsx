import React, { useMemo } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { curry, orderBy } from 'lodash';

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
  const Component = recordAttributeSectionWrappers[props.attribute.name] ?? props.DefaultComponent;

  return <Component {...props} />;
}

const recordAttributeSectionWrappers: Record<string, React.ComponentType<WrappedComponentProps<RecordAttributeSectionProps>>> = {
  [MSA_ATTRIBUTE_NAME]: MsaAttributeSection
};

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
  const Component = recordTableWrappers[props.table.name] ?? props.DefaultComponent;
  return <Component {...props} />;
}

const makeRecordTableWrapper = curry((
  makeAttributeFields: (ads: AttributeField[]) => AttributeField[],
  makeTableRow: (row: Record<string, AttributeValue>) => Record<string, AttributeValue>,
  props: WrappedComponentProps<RecordTableProps>
) => {
  const transformedTable = useMemo(
    () => ({
      ...props.table,
      attributes: makeAttributeFields(props.table.attributes)
    }),
    []
  );

  const transformedValue = useMemo(
    () => props.value.map(makeTableRow),
    [ props.value ]
  );

  return <props.DefaultComponent {...props} table={transformedTable} value={transformedValue} />;
});

const transformPfamsAttributeFields = curry((
  isGraphic: boolean,
  attributeFields: AttributeField[]
): AttributeField[] => {
  const renamedAttributeFields = attributeFields.map(
    attributeField => attributeField.name === ACCESSION_NUMBER_ATTRIBUTE_NAME
      ? { ...attributeField, displayName: 'Accession' }
      : attributeField
  );

  return isGraphic
    ? [...renamedAttributeFields, PFAM_LEGEND_ATTRIBUTE_FIELD]
    : renamedAttributeFields;
});

const makePfamsGraphicAttributeFields = transformPfamsAttributeFields(true);
const makePfamsDetailsAttributeFields = transformPfamsAttributeFields(false);

const transformPfamsTableRow = curry((
  isGraphic: boolean,
  row: Record<string, AttributeValue>
): Record<string, AttributeValue> => {
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
});

const makePfamsGraphicTableRow = transformPfamsTableRow(true);
const makePfamsDetailsTableRow = transformPfamsTableRow(false);

interface PseudoAttributeSpec {
  name: string;
  displayName: string;
}

const transformProteinPfamsAttributeFields = curry((
  pseudoAttributeSpecs: PseudoAttributeSpec[],
  attributeFields: AttributeField[]
): AttributeField[] => {
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
});

const makeProteinDomainLocationAttributeFields = transformProteinPfamsAttributeFields(
  [
    {
      name: SOURCE_ID_ATTRIBUTE_NAME,
      displayName: 'Accession'
    },
    {
      name: CORE_PERIPHERAL_NAME,
      displayName: 'Core/Peripheral'
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
  ]
);

function makeProteinDomainLocationsTableRow(row: Record<string, AttributeValue>): Record<string, AttributeValue> {
  const accessionValue = row[SOURCE_ID_ATTRIBUTE_NAME];

  return {
    ...row,
    [SOURCE_ID_ATTRIBUTE_NAME]: typeof accessionValue === 'string'
      ? { url: `/a/app/record/sequence/${accessionValue}`, displayText: accessionValue }
      : accessionValue,
  };
}

const RecordTable_PfamDomainGraphic = makeRecordTableWrapper(makePfamsGraphicAttributeFields, makePfamsGraphicTableRow);
const RecordTable_PfamDomainDetails = makeRecordTableWrapper(makePfamsDetailsAttributeFields, makePfamsDetailsTableRow);
const RecordTable_ProteinDomainLocations = makeRecordTableWrapper(makeProteinDomainLocationAttributeFields, makeProteinDomainLocationsTableRow);

const recordTableWrappers: Record<string, React.ComponentType<WrappedComponentProps<RecordTableProps>>> = {
  [PFAMS_TABLE_NAME]: RecordTable_PfamDomainGraphic,
  [PROTEIN_PFAMS_TABLE_NAME]: RecordTable_ProteinDomainLocations
};
