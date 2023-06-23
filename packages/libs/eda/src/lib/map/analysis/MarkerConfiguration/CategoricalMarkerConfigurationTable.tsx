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
};

export function CategoricalMarkerConfigurationTable<T>({
  overlayConfiguration,
  configuration,
  onChange,
}: Props<T>) {
  if (overlayConfiguration.overlayType !== 'categorical') return <></>;
  const { overlayValues, allValues } = overlayConfiguration;
  const selected = new Set(overlayValues);
  const totalCount = allValues.reduce((prev, curr) => prev + curr.count, 0);

  function handleSelection(data: AllValuesDefinition) {
    if (overlayValues.length <= ColorPaletteDefault.length - 1) {
      if (selected.has(data.label)) return;
      if (allValues.length > ColorPaletteDefault.length) {
        /**
         * This logic ensures that the "All other values" label:
         *  1. renders as the last overlayValue value
         *  2. renders as the last legend item
         */
        const allOtherValuesItem = [...overlayValues].pop() ?? '';
        onChange({
          ...configuration,
          selectedValues: overlayValues
            .slice(0, overlayValues.length - 1)
            .concat(data.label, allOtherValuesItem),
          allValues,
        });
      } else {
        onChange({
          ...configuration,
          selectedValues: overlayValues.concat(data.label),
          allValues,
        });
      }
    } else {
      // TODO: how do we want to handle these selections?
      alert(`Only ${ColorPaletteDefault.length - 1} values can be selected`);
    }
  }

  function handleDeselection(data: AllValuesDefinition) {
    onChange({
      ...configuration,
      selectedValues: overlayValues.filter((val) => val !== data.label),
      allValues,
    });
  }

  function handleCountsSelection(option: string) {
    onChange({
      ...configuration,
      selectedCountsOption: option as 'filtered' | 'visible',
    });
  }

  const tableState = {
    options: {
      isRowSelected: (value: AllValuesDefinition) => selected.has(value.label),
    },
    eventHandlers: {
      onRowSelect: handleSelection,
      onRowDeselect: handleDeselection,
      onMultipleRowSelect: () =>
        onChange({
          ...configuration,
          selectedValues: allValues.map((v) => v.label),
          allValues,
        }),
      onMultipleRowDeselect: () =>
        onChange({
          ...configuration,
          selectedValues: [UNSELECTED_TOKEN],
          allValues,
        }),
    },
    actions: [],
    rows: allValues as AllValuesDefinition[],
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
        // @ts-ignore
        selectedOption={
          configuration.selectedCountsOption == null
            ? 'filtered'
            : configuration.selectedCountsOption
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
