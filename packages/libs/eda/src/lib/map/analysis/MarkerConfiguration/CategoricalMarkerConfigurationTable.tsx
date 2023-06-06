import Mesa from '@veupathdb/wdk-client/lib/Components/Mesa';
import { OverlayConfig, AllValuesDefinition } from '../../../core';
import { Tooltip } from '@veupathdb/components/lib/components/widgets/Tooltip';
import { BarPlotMarkerConfiguration } from './BarPlotMarkerConfigurationMenu';
import { PieMarkerConfiguration } from './PieMarkerConfigurationMenu';
import { ColorPaletteDefault } from '@veupathdb/components/lib/types/plots';

type Props = {
  overlayConfiguration: OverlayConfig;
  onChange: (
    configuration: BarPlotMarkerConfiguration | PieMarkerConfiguration
  ) => void;
  configuration: BarPlotMarkerConfiguration | PieMarkerConfiguration;
};

export function CategoricalMarkerConfigurationTable({
  overlayConfiguration,
  configuration,
  onChange,
}: Props) {
  if (overlayConfiguration.overlayType !== 'categorical') return <></>;
  const selected = new Set(overlayConfiguration.overlayValues);
  const totalCount = overlayConfiguration.allValuesSorted.reduce(
    (prev, curr) => prev + curr.count,
    0
  );

  function handleSelection(data: AllValuesDefinition) {
    if (
      overlayConfiguration.overlayValues.length <=
        ColorPaletteDefault.length - 1 &&
      overlayConfiguration.overlayType === 'categorical'
    ) {
      if (selected.has(data.label)) return;
      onChange({
        ...configuration,
        selectedValues: overlayConfiguration.overlayValues.concat(data.label),
        allValues: overlayConfiguration.allValuesSorted,
      });
    } else {
      alert(`Only ${ColorPaletteDefault.length - 1} values can be selected`);
    }
  }

  function handleDeselection(data: AllValuesDefinition) {
    if (overlayConfiguration.overlayType === 'categorical')
      onChange({
        ...configuration,
        selectedValues: overlayConfiguration.overlayValues.filter(
          (val) => val !== data.label
        ),
        allValues: overlayConfiguration.allValuesSorted,
      });
  }

  const tableState = {
    options: {
      isRowSelected: (sortedValue: AllValuesDefinition) =>
        selected.has(sortedValue.label),
    },
    eventHandlers: {
      onRowSelect: handleSelection,
      onRowDeselect: handleDeselection,
    },
    actions: [],
    rows: overlayConfiguration.allValuesSorted as AllValuesDefinition[],
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
  return <Mesa state={tableState} />;
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
