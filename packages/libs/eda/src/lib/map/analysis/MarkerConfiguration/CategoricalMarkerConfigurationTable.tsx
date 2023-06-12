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
  const { overlayType, overlayValues, allValues } = overlayConfiguration;
  const selected = new Set(overlayValues);
  const totalCount = allValues.reduce((prev, curr) => prev + curr.count, 0);

  function handleSelection(data: AllValuesDefinition) {
    if (
      overlayValues.length <= ColorPaletteDefault.length - 1 &&
      overlayType === 'categorical'
    ) {
      if (selected.has(data.label)) return;
      const lastItem = [...overlayValues].pop() ?? ''; // TEMP until better solution
      onChange({
        ...configuration,
        selectedValues: overlayValues
          .slice(0, overlayValues.length - 1)
          .concat(data.label, lastItem),
        allValues,
      });
    } else {
      alert(`Only ${ColorPaletteDefault.length - 1} values can be selected`);
    }
  }

  function handleDeselection(data: AllValuesDefinition) {
    if (overlayType === 'categorical')
      onChange({
        ...configuration,
        selectedValues: overlayValues.filter((val) => val !== data.label),
        allValues,
      });
  }

  const tableState = {
    options: {
      isRowSelected: (value: AllValuesDefinition) => selected.has(value.label),
    },
    eventHandlers: {
      onRowSelect: handleSelection,
      onRowDeselect: handleDeselection,
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
