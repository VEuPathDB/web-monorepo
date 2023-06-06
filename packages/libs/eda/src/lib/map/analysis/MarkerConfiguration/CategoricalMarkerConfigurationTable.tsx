import Mesa from '@veupathdb/wdk-client/lib/Components/Mesa';
import { OverlayConfig } from '../../../core';
import { Tooltip } from '@veupathdb/components/lib/components/widgets/Tooltip';
import { BarPlotMarkerConfiguration } from './BarPlotMarkerConfigurationMenu';
import { ColorPaletteDefault } from '@veupathdb/components/lib/types/plots';

type Props = {
  overlayConfiguration: OverlayConfig;
  onChange: (configuration: BarPlotMarkerConfiguration) => void;
  configuration: BarPlotMarkerConfiguration;
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

  function handleSelection(data: any) {
    if (
      overlayConfiguration.overlayValues.length <=
      ColorPaletteDefault.length - 1
    ) {
      if (selected.has(data.label)) return;
      onChange({
        ...configuration,
        // @ts-ignore
        selectedValues: overlayConfiguration.overlayValues.concat(data.label),
        // @ts-ignore
        allValues: overlayConfiguration.allValuesSorted,
      });
    } else {
      alert(`Only ${ColorPaletteDefault.length - 1} values can be selected`);
    }
  }

  function handleDeselection(data: any) {
    onChange({
      ...configuration,
      // @ts-ignore
      selectedValues: overlayConfiguration.overlayValues.filter(
        // @ts-ignore
        (val) => val !== data.label
      ),
      // @ts-ignore
      allValues: overlayConfiguration.allValuesSorted,
    });
  }

  const tableState = {
    options: {
      isRowSelected: (sortedValue: any) => selected.has(sortedValue.label),
    },
    eventHandlers: {
      onRowSelect: handleSelection,
      onRowDeselect: handleDeselection,
    },
    actions: [],
    rows: overlayConfiguration.allValuesSorted,
    // rows: overlayConfiguration.overlayValues,
    columns: [
      {
        key: 'values',
        name: 'Values',
        renderCell: (data: { row: any }) => (
          <>{data.row.label}</>
          // <>{data.row}</>
        ),
      },
      {
        key: 'counts',
        name: 'Counts',
        renderCell: (data: { row: any }) => <>{data.row.count}</>,
      },
      {
        key: 'distribution',
        name: 'Distribution',
        renderCell: (data: { row: any }) => (
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
