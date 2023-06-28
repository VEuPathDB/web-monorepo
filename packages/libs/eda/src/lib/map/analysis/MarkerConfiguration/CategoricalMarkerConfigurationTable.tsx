import { useState } from 'react';
import Mesa from '@veupathdb/wdk-client/lib/Components/Mesa';
import { MesaSortObject } from '@veupathdb/wdk-client/lib/Core/CommonTypes';
import { AllValuesDefinition } from '../../../core';
import { Tooltip } from '@veupathdb/components/lib/components/widgets/Tooltip';
import { ColorPaletteDefault } from '@veupathdb/components/lib/types/plots';
import RadioButtonGroup from '@veupathdb/components/lib/components/widgets/RadioButtonGroup';
import { UNSELECTED_TOKEN } from '../../';
import { SharedMarkerConfigurations } from './PieMarkerConfigurationMenu';
import { orderBy } from 'lodash';

type Props<T> = {
  overlayValues: string[];
  onChange: (configuration: T) => void;
  configuration: T;
  uncontrolledSelections: Set<string>;
  setUncontrolledSelections: (v: Set<string>) => void;
  allCategoricalValues: AllValuesDefinition[] | undefined;
  selectedCountsOption: SharedMarkerConfigurations['selectedCountsOption'];
};

const DEFAULT_SORTING: MesaSortObject = {
  columnKey: 'count',
  direction: 'desc',
};

export function CategoricalMarkerConfigurationTable<T>({
  overlayValues,
  configuration,
  onChange,
  uncontrolledSelections,
  setUncontrolledSelections,
  allCategoricalValues = [],
  selectedCountsOption,
}: Props<T>) {
  const [sort, setSort] = useState<MesaSortObject | null>(DEFAULT_SORTING);
  const controlledSelections = new Set(overlayValues);
  const totalCount = allCategoricalValues.reduce(
    (prev, curr) => prev + curr.count,
    0
  );

  function handleSelection(data: AllValuesDefinition) {
    if (overlayValues.length <= ColorPaletteDefault.length - 1) {
      if (
        uncontrolledSelections.has(data.label) ||
        controlledSelections.has(data.label)
      )
        return;
      const nextSelections = new Set(uncontrolledSelections);
      nextSelections.add(data.label);
      setUncontrolledSelections(nextSelections);
      if (
        allCategoricalValues &&
        allCategoricalValues.length > ColorPaletteDefault.length
      ) {
        onChange({
          ...configuration,
          /**
           * This logic ensures that the "All other values" label:
           *  1. renders as the last overlayValue value
           *  2. renders as the last legend item
           */
          selectedValues: overlayValues
            .slice(0, overlayValues.length - 1)
            .concat(data.label, UNSELECTED_TOKEN),
        });
      } else {
        onChange({
          ...configuration,
          selectedValues: overlayValues.concat(data.label),
        });
      }
    } else {
      const nextSelections = new Set(uncontrolledSelections);
      nextSelections.add(data.label);
      setUncontrolledSelections(nextSelections);
    }
  }

  function handleDeselection(data: AllValuesDefinition) {
    const nextSelections = new Set(uncontrolledSelections);
    nextSelections.delete(data.label);
    if (nextSelections.size <= ColorPaletteDefault.length) {
      /**
       * We want "All other values" label to be at the end, so if it exists:
       *  - delete it from the Set
       *  - add it back to the end of the Set
       */
      if (nextSelections.has(UNSELECTED_TOKEN)) {
        nextSelections.delete(UNSELECTED_TOKEN);
        nextSelections.add(UNSELECTED_TOKEN);
      }
      const newSelectedValues: string[] = [];
      nextSelections.forEach((v) => newSelectedValues.push(v));
      onChange({
        ...configuration,
        selectedValues: newSelectedValues,
      });
    }
    setUncontrolledSelections(nextSelections);
  }

  function handleCountsSelection(option: string) {
    onChange({
      ...configuration,
      selectedCountsOption: option as 'filtered' | 'visible',
    });
  }

  const tableState = {
    options: {
      isRowSelected: (value: AllValuesDefinition) =>
        uncontrolledSelections.has(value.label),
    },
    eventHandlers: {
      onRowSelect: handleSelection,
      onRowDeselect: handleDeselection,
      onMultipleRowSelect: () => {
        const nextSelections = new Set(
          allCategoricalValues.map((v) => v.label)
        );
        setUncontrolledSelections(nextSelections);
        if (nextSelections.size <= ColorPaletteDefault.length - 1) {
          onChange({
            ...configuration,
            selectedValues: allCategoricalValues.map((v) => v.label),
          });
        }
      },
      onMultipleRowDeselect: () => {
        setUncontrolledSelections(new Set([UNSELECTED_TOKEN]));
        onChange({
          ...configuration,
          selectedValues: [UNSELECTED_TOKEN],
        });
      },
      onSort: (
        { key: columnKey }: { key: string },
        direction: MesaSortObject['direction']
      ) => setSort({ columnKey, direction }),
    },
    actions: [],
    uiState: { sort },
    rows:
      sort === null
        ? (allCategoricalValues as AllValuesDefinition[])
        : orderBy(allCategoricalValues, [sort.columnKey], [sort.direction]),
    columns: [
      {
        /**
         * For proper sorting in Mesa, the column keys must match the data object's keys. The data objects
         * used in this table are defined by AllValuesDefinition, hence the divergence of the column keys
         * from the column names for the two sortable columns.
         */
        key: 'label',
        name: 'Values',
        sortable: true,
        renderCell: (data: { row: AllValuesDefinition }) => (
          <>{data.row.label}</>
        ),
      },
      {
        key: 'count',
        name: 'Counts',
        sortable: true,
        renderCell: (data: { row: AllValuesDefinition }) => (
          <>{data.row.count}</>
        ),
      },
      {
        key: 'distribution',
        name: 'Distribution',
        renderCell: (data: { row: AllValuesDefinition }) => (
          <Distribution count={data.row.count} filteredTotal={totalCount} />
        ),
      },
    ],
  };
  return (
    <div
      style={{
        padding: 15,
        border: `1px solid rgb(204,204,204)`,
        width: 'fit-content',
      }}
    >
      <div
        style={{
          maxWidth: '50vw',
          maxHeight: 300,
          overflow: 'auto',
        }}
      >
        <Mesa state={tableState} />
      </div>
      <RadioButtonGroup
        containerStyles={
          {
            // marginTop: 20,
          }
        }
        label="Show counts for:"
        selectedOption={
          selectedCountsOption == null ? 'filtered' : selectedCountsOption
        }
        options={['filtered', 'visible']}
        optionLabels={['Filtered', 'Visible']}
        buttonColor={'primary'}
        // margins={['0em', '0', '0', '1em']}
        onOptionSelected={handleCountsSelection}
      />
    </div>
  );
}

type DistributionProps = {
  count: number;
  filteredTotal: number;
};

function Distribution({ count, filteredTotal }: DistributionProps) {
  return (
    <Tooltip title={`${count} out of ${filteredTotal}`}>
      <div
        style={{
          width: '99%',
          position: 'relative',
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            width: (count / filteredTotal) * 100 + '%',
            backgroundColor: 'black',
            minWidth: 1,
            position: 'absolute',
            height: '1em',
          }}
        ></div>
      </div>
    </Tooltip>
  );
}
