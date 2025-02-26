import React, { useMemo } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { curry, orderBy } from 'lodash';

import {
  AttributeField,
  AttributeValue,
  LinkAttributeValue,
  TableValue,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';

import { PfamDomain } from 'ortho-client/components/pfam-domains/PfamDomain';
import { Domain } from 'ortho-client/components/pfam-domains/PfamDomainArchitecture';

import {
  RecordTableProps,
  WrappedComponentProps,
} from 'ortho-client/records/Types';

export const ACCESSION_ATTRIBUTE_NAME = 'accession';
export const DOMAIN_START_ATTRIBUTE_NAME = 'start_min';
export const DOMAIN_END_ATTRIBUTE_NAME = 'end_max';

interface AttributeFieldWithOptionalType extends AttributeField {
  type?: string;
}

export const PFAM_LEGEND_ATTRIBUTE_FIELD: AttributeFieldWithOptionalType = {
  name: 'legend',
  displayName: 'Legend',
  isDisplayable: true,
  isSortable: false,
  isRemovable: false,
  truncateTo: 100,
  formats: [],
};

export const PFAM_DOMAINS_ATTRIBUTE_FIELD: AttributeFieldWithOptionalType = {
  name: 'domains',
  displayName: ' ',
  isDisplayable: true,
  isSortable: false,
  isRemovable: false,
  truncateTo: 100,
  formats: [],
};

const COUNT_ATTRIBUTE_NAME = 'count';
const ABBREV_ATTRIBUTE_NAME = 'abbrev';

export const GROUP_STATISTICS_TABLE_NAME = 'Statistics';
export const TAXON_COUNTS_TABLE_NAME = 'TaxonCounts';
export const SEQUENCES_TABLE_NAME = 'Sequences';
export const PROTEIN_PFAMS_TABLE_NAME = 'ProteinPFams';

interface PseudoAttributeSpec {
  name: string;
  displayName: string;
  type?: string;
}

export const makeCommonRecordTableWrapper = curry(
  (
    makeAttributeFields: (
      ads: AttributeFieldWithOptionalType[]
    ) => AttributeFieldWithOptionalType[],
    makeTableRow: (
      row: Record<string, AttributeValue>
    ) => Record<string, AttributeValue>,
    props: WrappedComponentProps<RecordTableProps>
  ) => {
    const transformedTable = useMemo(
      () => ({
        ...props.table,
        attributes: makeAttributeFields(props.table.attributes),
      }),
      []
    );

    const transformedValue = useMemo(
      () => props.value.map(makeTableRow),
      [props.value]
    );

    return (
      <props.DefaultComponent
        {...props}
        table={transformedTable}
        value={transformedValue}
      />
    );
  }
);

export const transformAttributeFieldsUsingSpecs = curry(
  (
    pseudoAttributeSpecs: PseudoAttributeSpec[],
    attributeFields: AttributeFieldWithOptionalType[]
  ): AttributeFieldWithOptionalType[] => {
    const augmentedAttributeFields = [
      ...attributeFields,
      PFAM_LEGEND_ATTRIBUTE_FIELD,
      PFAM_DOMAINS_ATTRIBUTE_FIELD,
    ];

    const filteredAttributeFields = augmentedAttributeFields.filter(
      (attributeField) =>
        pseudoAttributeSpecs.find((pa) => pa.name === attributeField.name)
    );

    const filteredAttributeFieldsWithOptionalType = filteredAttributeFields.map(
      (attributeField) => {
        const pseudoAttribute = pseudoAttributeSpecs.find(
          (pa) => pa.name === attributeField.name
        );
        if (pseudoAttribute && 'type' in pseudoAttribute) {
          return {
            ...attributeField,
            type: pseudoAttribute.type,
          };
        }
        return attributeField;
      }
    );

    const attributeDisplayNames = new Map(
      pseudoAttributeSpecs.map((pa) => [pa.name, pa.displayName])
    );

    const renamedAttributeFields = filteredAttributeFieldsWithOptionalType.map(
      (attributeField) => ({
        ...attributeField,
        displayName:
          attributeDisplayNames.get(attributeField.name) ?? attributeField.name,
      })
    );

    const reorderedAttributeFields = orderBy(
      renamedAttributeFields,
      (attributeField) =>
        pseudoAttributeSpecs.findIndex((pa) => pa.name === attributeField.name)
    );

    return reorderedAttributeFields;
  }
);

export function makeDomainAccessionLink(accession: string) {
  return {
    url: `https://www.ebi.ac.uk/interpro/entry/pfam/${accession}`,
    displayText: accession,
  };
}

export function makeSourceAccessionLink(accession: string): LinkAttributeValue {
  return {
    url: `/a/app/record/sequence/${accession}`,
    displayText: accession,
  };
}

export function makePfamLegendMarkup(pfamId: string) {
  return renderToStaticMarkup(<PfamDomain pfamId={pfamId} />);
}

export function extractPfamDomain(
  row: Record<string, AttributeValue>
): Domain[] {
  const pfamIdAttributeValue = row[ACCESSION_ATTRIBUTE_NAME];
  const domainStartAttributeValue = row[DOMAIN_START_ATTRIBUTE_NAME];
  const domainEndAttributeValue = row[DOMAIN_END_ATTRIBUTE_NAME];

  return typeof pfamIdAttributeValue === 'string' &&
    typeof domainStartAttributeValue === 'string' &&
    typeof domainEndAttributeValue === 'string'
    ? [
        {
          pfamId: pfamIdAttributeValue,
          start: Number(domainStartAttributeValue),
          end: Number(domainEndAttributeValue),
        },
      ]
    : [];
}

export function taxonCountsTableValueToMap(taxonCountsTableValue: TableValue) {
  return taxonCountsTableValue.reduce((counts, countRow) => {
    const abbrevValue = countRow[ABBREV_ATTRIBUTE_NAME];
    const countValue = countRow[COUNT_ATTRIBUTE_NAME];

    if (typeof abbrevValue !== 'string') {
      throw new Error(
        makeAttributeTypeMismatchError(
          'a non-string',
          ABBREV_ATTRIBUTE_NAME,
          TAXON_COUNTS_TABLE_NAME
        )
      );
    }

    if (typeof countValue !== 'string') {
      throw new Error(
        makeAttributeTypeMismatchError(
          'a non-string',
          COUNT_ATTRIBUTE_NAME,
          TAXON_COUNTS_TABLE_NAME
        )
      );
    }

    counts[abbrevValue] = Number(countValue);

    return counts;
  }, {} as Record<string, number>);
}

function makeAttributeTypeMismatchError(
  typeMismatch: string,
  attributeName: string,
  tableName: string
) {
  return `Encountered ${typeMismatch} '${attributeName}' in a '${tableName}' row`;
}
