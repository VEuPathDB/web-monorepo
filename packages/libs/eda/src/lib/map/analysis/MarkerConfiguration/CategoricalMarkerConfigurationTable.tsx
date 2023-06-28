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
  const [sort, setSort] = useState<MesaSortObject>(DEFAULT_SORTING);
  const controlledSelections = new Set(overlayValues);
  const totalCount = allCategoricalValues.reduce(
    (prev, curr) => prev + curr.count,
    0
  );

  function handleSelection(data: AllValuesDefinition) {
    // check if we already have selected the maximum allowed
    if (overlayValues.length <= ColorPaletteDefault.length - 1) {
      // return early if we somehow duplicate a selection
      if (
        uncontrolledSelections.has(data.label) ||
        controlledSelections.has(data.label)
      )
        return;
      const nextSelections = new Set(uncontrolledSelections);
      nextSelections.add(data.label);
      setUncontrolledSelections(nextSelections);
      // check if we have the "All other values" label by seeing if the number of values in the table is greater than the allowable limit
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
        // can set the new configuration without worrying about the "All other values" data
      } else {
        onChange({
          ...configuration,
          selectedValues: overlayValues.concat(data.label),
        });
      }
      // we're already at the limit for selections, so just track the selections for the table state, but don't set the configuration
    } else {
      const nextSelections = new Set(uncontrolledSelections);
      nextSelections.add(data.label);
      setUncontrolledSelections(nextSelections);
    }
  }

  function handleDeselection(data: AllValuesDefinition) {
    /**
     * After we delete the value from our newly initialized Set, we'll check if we're within the allowable selections limit.
     *  - When true, we remove the "All other values" label if it exists, tack it back onto the end, then set the new configuration
     *  - When false, we set the table's selection state without setting a new configuration
     */
    const nextSelections = new Set(uncontrolledSelections);
    nextSelections.delete(data.label);
    if (nextSelections.size <= ColorPaletteDefault.length) {
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
        /**
         * This handler actually selects all values, but we may exceed the allowable selections. Thus, we have to check if we're within the allowable selection limit.
         *  - When true, we can set both the table state and the configuration to all the values
         *  - When false, we only set the table state to all the values and bypass setting the configuration
         */
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
        /**
         * This handler actually deselects all values by setting the table state and the configuration to the "All other labels" value
         */
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
