import { useState } from 'react';
import Mesa from '@veupathdb/coreui/lib/components/Mesa';
import {
  MesaSortObject,
  MesaStateProps,
} from '@veupathdb/coreui/lib/components/Mesa/types';
import { AllValuesDefinition } from '../../../core';
import { Tooltip } from '@veupathdb/components/lib/components/widgets/Tooltip';
import { ColorPaletteDefault } from '@veupathdb/components/lib/types/plots';
import RadioButtonGroup from '@veupathdb/components/lib/components/widgets/RadioButtonGroup';
import { UNSELECTED_TOKEN } from '../../constants';
import { orderBy } from 'lodash';
import { SelectedCountsOption } from '../appState';
import Spinner from '@veupathdb/components/lib/components/Spinner';
import { SharedMarkerConfigurations } from '../mapTypes/shared';

type Props<T> = {
  overlayValues: string[];
  onChange: (configuration: T) => void;
  configuration: T;
  uncontrolledSelections: Set<string>;
  setUncontrolledSelections: (v: Set<string>) => void;
  allCategoricalValues: AllValuesDefinition[] | undefined;
  selectedCountsOption: SelectedCountsOption;
};

const DEFAULT_SORTING: MesaSortObject = {
  columnKey: 'count',
  direction: 'desc',
};

export const MAXIMUM_ALLOWABLE_VALUES = ColorPaletteDefault.length;

export function CategoricalMarkerConfigurationTable<
  T extends SharedMarkerConfigurations
>({
  overlayValues,
  configuration,
  onChange,
  uncontrolledSelections,
  setUncontrolledSelections,
  allCategoricalValues = [],
  selectedCountsOption,
}: Props<T>) {
  const [sort, setSort] = useState<MesaSortObject>(DEFAULT_SORTING);
  const totalCount = allCategoricalValues?.reduce(
    (prev, curr) => prev + curr.count,
    0
  );
  const numberOfAvailableValues = allCategoricalValues.length;

  function handleSelection(data: AllValuesDefinition) {
    if (overlayValues.length < MAXIMUM_ALLOWABLE_VALUES) {
      // return early if we somehow duplicate a selection
      if (uncontrolledSelections.has(data.label)) return;
      const nextSelections = new Set(uncontrolledSelections);
      nextSelections.add(data.label);
      setUncontrolledSelections(nextSelections);
      // check if we have the "All other values" label so we can do some extra processing as needed
      if (overlayValues.includes(UNSELECTED_TOKEN)) {
        // remove UNSELECTED_TOKEN if all selections are made and we're not exceeding the max
        const newArrayValues = [data.label].concat(
          numberOfAvailableValues <= MAXIMUM_ALLOWABLE_VALUES &&
            nextSelections.size - 1 === numberOfAvailableValues
            ? []
            : [UNSELECTED_TOKEN]
        );
        onChange({
          ...configuration,
          // this logic plus the logic for newArrayValues ensures that, when present, the "All other values"
          // attribute is the last item in the overlayValues array, thus rendering it as the last item
          // in the legend
          selectedValues: overlayValues
            .slice(0, overlayValues.length - 1)
            .concat(newArrayValues),
        });
      } else {
        // no "All other values" data so we need
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
    if (nextSelections.size <= MAXIMUM_ALLOWABLE_VALUES) {
      if (nextSelections.has(UNSELECTED_TOKEN)) {
        nextSelections.delete(UNSELECTED_TOKEN);
        nextSelections.add(UNSELECTED_TOKEN);
      }
      onChange({
        ...configuration,
        selectedValues: Array.from(nextSelections),
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

  const tableState: MesaStateProps<
    AllValuesDefinition,
    keyof AllValuesDefinition | 'distribution'
  > = {
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
         * Note we also need to make sure we include the "All other labels" value if necessary
         */
        const nextSelections = new Set(
          allCategoricalValues.map((v) => v.label)
        );
        if (overlayValues.includes(UNSELECTED_TOKEN)) {
          nextSelections.add(UNSELECTED_TOKEN);
        }
        setUncontrolledSelections(nextSelections);
        if (nextSelections.size <= MAXIMUM_ALLOWABLE_VALUES) {
          onChange({
            ...configuration,
            selectedValues: allCategoricalValues.map((v) => v.label),
          });
        }
      },
      onMultipleRowDeselect: () => {
        /**
         * This handler actually deselects all values by setting the table
         * state and the configuration to the "All other labels" value.
         * However, if there are only a few possible values,
         * we won't show "All other labels".
         */
        const emptySelection =
          numberOfAvailableValues < MAXIMUM_ALLOWABLE_VALUES
            ? []
            : [UNSELECTED_TOKEN];

        setUncontrolledSelections(new Set(emptySelection));
        onChange({
          ...configuration,
          selectedValues: emptySelection,
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
        style: {
          wordBreak: 'break-word',
          hyphens: 'auto',
        },
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
        padding: 10,
        border: `1px solid rgb(204,204,204)`,
        width: 'fit-content',
      }}
    >
      <div
        style={{
          maxWidth: '340px',
          maxHeight: 300,
          minHeight: 60,
          overflow: 'auto',
        }}
      >
        {tableState.rows.length === 0 ? (
          <Spinner
            size={50}
            styleOverrides={{
              position: 'relative',
              top: '0%',
              left: '0%',
              transform: '',
            }}
          />
        ) : (
          <Mesa state={tableState} />
        )}
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
        margins={['1em', '0', '0', '0em']}
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
