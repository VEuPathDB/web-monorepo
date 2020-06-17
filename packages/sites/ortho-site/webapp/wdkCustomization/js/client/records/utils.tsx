import React, { useMemo } from 'react';

import { curry, orderBy } from 'lodash'

import { AttributeField, AttributeValue } from 'wdk-client/Utils/WdkModel';

import { RecordTableProps, WrappedComponentProps } from './Types';

export const PFAM_LEGEND_ATTRIBUTE_FIELD: AttributeField = {
  name: 'legend',
  displayName: 'Legend',
  isDisplayable: true,
  isSortable: false,
  isRemovable: false,
  truncateTo: 100,
  formats: []
};

export const PFAM_DOMAINS_ATTRIBUTE_FIELD: AttributeField = {
  name: 'domains',
  displayName: ' ',
  isDisplayable: true,
  isSortable: false,
  isRemovable: false,
  truncateTo: 100,
  formats: []
};

interface PseudoAttributeSpec {
  name: string;
  displayName: string;
}

export const makeCommonRecordTableWrapper = curry((
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

export const transformAttributeFieldsUsingSpecs = curry((
  pseudoAttributeSpecs: PseudoAttributeSpec[],
  attributeFields: AttributeField[]
): AttributeField[] => {
  const augmentedAttributeFields = [
    ...attributeFields,
    PFAM_LEGEND_ATTRIBUTE_FIELD,
    PFAM_DOMAINS_ATTRIBUTE_FIELD
  ];

  const filteredAttributeFields = augmentedAttributeFields.filter(
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

