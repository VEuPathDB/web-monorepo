import Mesa from '@veupathdb/wdk-client/lib/Components/Mesa';
import { OverlayConfig, AllValuesDefinition } from '../../../core';
import { Tooltip } from '@veupathdb/components/lib/components/widgets/Tooltip';
import { ColorPaletteDefault } from '@veupathdb/components/lib/types/plots';
import RadioButtonGroup from '@veupathdb/components/lib/components/widgets/RadioButtonGroup';
import { UNSELECTED_TOKEN } from '../../';

type Props<T> = {
  overlayConfiguration: OverlayConfig;
  onChange: (configuration: T) => void;
  configuration: T;
  uncontrolledSelections: Set<string>;
  setUncontrolledSelections: (v: Set<string>) => void;
  allCategoricalValues: AllValuesDefinition[] | undefined;
};

export function CategoricalMarkerConfigurationTable<T>({
  overlayConfiguration,
  configuration,
  onChange,
  uncontrolledSelections,
  setUncontrolledSelections,
  allCategoricalValues,
}: Props<T>) {
  if (
    overlayConfiguration.overlayType !== 'categorical' ||
    !allCategoricalValues
  )
    return <></>;
  const { overlayValues } = overlayConfiguration;
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
      // remove "All other values" label, then add it back to the end;
      // this ensures it's always the last item in the legend
      nextSelections.delete(UNSELECTED_TOKEN);
      nextSelections.add(UNSELECTED_TOKEN);
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
    },
    actions: [],
    rows: allCategoricalValues as AllValuesDefinition[],
    columns: [
      {
        key: 'values',
        name: 'Values',
        renderCell: (data: { row: AllValuesDefinition }) => (
          <>{data.row.label}</>
        ),
      },
      {
        key: 'counts',
        name: 'Counts',
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
          // @ts-ignore
          configuration.selectedCountsOption == null
            ? 'filtered'
            : // @ts-ignore
              configuration.selectedCountsOption
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
