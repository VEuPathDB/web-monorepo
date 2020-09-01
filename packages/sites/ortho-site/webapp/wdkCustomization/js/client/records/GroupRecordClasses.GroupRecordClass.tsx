import React, { useMemo } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { curry, groupBy, isNaN, uniqBy } from 'lodash';

import { CollapsibleSection, Loading } from 'wdk-client/Components';
import { AttributeField, AttributeValue } from 'wdk-client/Utils/WdkModel';

import { useTaxonUiMetadata } from 'ortho-client/hooks/taxons';
import { PhyleticDistributionCheckbox } from 'ortho-client/components/phyletic-distribution/PhyleticDistributionCheckbox';

import { PfamDomainArchitecture } from '../components/pfam-domains/PfamDomainArchitecture';

import { RecordAttributeSectionProps, RecordTableProps, WrappedComponentProps } from './Types';
import {
  ACCESSION_ATTRIBUTE_NAME,
  DOMAIN_END_ATTRIBUTE_NAME,
  DOMAIN_START_ATTRIBUTE_NAME,
  PFAM_DOMAINS_ATTRIBUTE_FIELD,
  PFAM_LEGEND_ATTRIBUTE_FIELD,
  extractPfamDomain,
  makeCommonRecordTableWrapper,
  makeDomainAccessionLink,
  makePfamLegendMarkup,
  makeSourceAccessionLink,
  transformAttributeFieldsUsingSpecs
} from './utils'

import './GroupRecordClasses.GroupRecordClass.scss';

const MSA_ATTRIBUTE_NAME = 'msa';

const PFAMS_TABLE_NAME = 'PFams';
const PROTEIN_PFAMS_TABLE_NAME = 'ProteinPFams';
const TAXON_COUNTS_TABLE_NAME = 'TaxonCounts';

const CORE_PERIPHERAL_ATTRIBUTE_NAME = 'core_peripheral';
const PROTEIN_LENGTH_ATTRIBUTE_NAME = 'protein_length';
const SOURCE_ID_ATTRIBUTE_NAME = 'full_id';

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

const transformPfamsAttributeFields = curry((
  isGraphic: boolean,
  attributeFields: AttributeField[]
): AttributeField[] => {
  const renamedAttributeFields = attributeFields.map(
    attributeField => attributeField.name === ACCESSION_ATTRIBUTE_NAME
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
  const accessionValue = row[ACCESSION_ATTRIBUTE_NAME];

  // The accession value should be rendered as a link, and if
  // the table is in "graphic" mode, a value for the "legend" column should
  // be provided
  return {
    ...row,
    [ACCESSION_ATTRIBUTE_NAME]: typeof accessionValue === 'string'
      ? makeDomainAccessionLink(accessionValue)
      : accessionValue,
    legend: isGraphic && typeof accessionValue === 'string'
      ? makePfamLegendMarkup(accessionValue)
      : null
  };
});

const makePfamsGraphicTableRow = transformPfamsTableRow(true);
const makePfamsDetailsTableRow = transformPfamsTableRow(false);

const makeProteinDomainLocationAttributeFields = transformAttributeFieldsUsingSpecs(
  [
    {
      name: SOURCE_ID_ATTRIBUTE_NAME,
      displayName: 'Accession'
    },
    {
      name: CORE_PERIPHERAL_ATTRIBUTE_NAME,
      displayName: 'Core/Peripheral'
    },
    {
      name: PROTEIN_LENGTH_ATTRIBUTE_NAME,
      displayName: 'Protein Length'
    },
    {
      name: ACCESSION_ATTRIBUTE_NAME,
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

const makeProteinDomainArchitectureAttributeFields = transformAttributeFieldsUsingSpecs(
  [
    {
      name: SOURCE_ID_ATTRIBUTE_NAME,
      displayName: 'Accession'
    },
    {
      name: CORE_PERIPHERAL_ATTRIBUTE_NAME,
      displayName: 'Core/Peripheral'
    },
    {
      name: PROTEIN_LENGTH_ATTRIBUTE_NAME,
      displayName: 'Protein Length'
    },
    PFAM_DOMAINS_ATTRIBUTE_FIELD
  ]
);

function makeProteinDomainLocationsTableRow(row: Record<string, AttributeValue>): Record<string, AttributeValue> {
  const accessionValue = row[SOURCE_ID_ATTRIBUTE_NAME];

  return {
    ...row,
    [SOURCE_ID_ATTRIBUTE_NAME]: typeof accessionValue === 'string'
      ? makeSourceAccessionLink(accessionValue)
      : accessionValue
  };
}

const RecordTable_PfamDomainGraphic = makeCommonRecordTableWrapper(makePfamsGraphicAttributeFields, makePfamsGraphicTableRow);
const RecordTable_PfamDomainDetails = makeCommonRecordTableWrapper(makePfamsDetailsAttributeFields, makePfamsDetailsTableRow);
const RecordTable_ProteinDomainLocations = makeCommonRecordTableWrapper(makeProteinDomainLocationAttributeFields, makeProteinDomainLocationsTableRow);

function RecordTable_TaxonCounts(props: WrappedComponentProps<RecordTableProps>) {
  const selectionConfig = useMemo(
    () => ({ selectable: false } as const),
    []
  );

  const speciesCounts = useMemo(
    () => ({}),
    []
  );

  const taxonUiMetadata = useTaxonUiMetadata();

  return taxonUiMetadata == null
    ? <Loading />
    : <PhyleticDistributionCheckbox
        selectionConfig={selectionConfig}
        speciesCounts={speciesCounts}
        taxonTree={taxonUiMetadata.taxonTree}
      />
}


function RecordTable_ProteinDomainArchitectures(props: WrappedComponentProps<RecordTableProps>) {
  const maxLength = useMemo(
    () => (
      Math.max(
        ...props.value.map(
          row => Number(row[PROTEIN_LENGTH_ATTRIBUTE_NAME])
        )
      )
    ),
    [ props.value ]
  );

  const transformedTable = useMemo(
    () => ({
      ...props.table,
      attributes: makeProteinDomainArchitectureAttributeFields(props.table.attributes)
    }),
    []
  );

  const transformedRecords = useMemo(() => {
    const rowsByAccession = groupBy(props.value, SOURCE_ID_ATTRIBUTE_NAME);
    const uniqueRows = uniqBy(props.value, SOURCE_ID_ATTRIBUTE_NAME);
    const rowsWithPfamDomains = uniqueRows.map(
      row => {
        const accessionValue = row[SOURCE_ID_ATTRIBUTE_NAME];

        return typeof accessionValue === 'string'
          ? {
              ...row,
              [SOURCE_ID_ATTRIBUTE_NAME]: makeSourceAccessionLink(accessionValue),
              [PFAM_DOMAINS_ATTRIBUTE_FIELD.name]: makePfamDomainMarkup(rowsByAccession[accessionValue], maxLength)
            }
          : row;
      }
    );

    return rowsWithPfamDomains;
  }, [ props.value ]);

  return <props.DefaultComponent {...props} table={transformedTable} value={transformedRecords} />;
}

function makePfamDomainMarkup(rowGroup: Record<string, AttributeValue>[], maxLength: number): string {
  const proteinLength = Number(rowGroup[0][PROTEIN_LENGTH_ATTRIBUTE_NAME]);
  const pfamDomains = rowGroup.flatMap(extractPfamDomain);

  return !isNaN(proteinLength) && !isNaN(maxLength)
    ? renderToStaticMarkup(
        <PfamDomainArchitecture
          style={{ width: `${(proteinLength / maxLength) * 100}%` }}
          length={Number(proteinLength)}
          domains={pfamDomains}
        />
      )
    : '';
}

const recordTableWrappers: Record<string, React.ComponentType<WrappedComponentProps<RecordTableProps>>> = {
  [PFAMS_TABLE_NAME]: RecordTable_PfamDomainGraphic,
  [PROTEIN_PFAMS_TABLE_NAME]: RecordTable_ProteinDomainArchitectures,
  [TAXON_COUNTS_TABLE_NAME]: RecordTable_TaxonCounts
};
