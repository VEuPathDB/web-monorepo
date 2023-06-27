import { OverlayConfig } from '../../../core';
import { ColorPaletteDefault } from '@veupathdb/components/lib/types/plots';
import { ChartMarkerStandalone } from '@veupathdb/components/lib/map/ChartMarker';
import { DonutMarkerStandalone } from '@veupathdb/components/lib/map/DonutMarker';
import { UNSELECTED_TOKEN } from '../..';
import Banner from '@veupathdb/coreui/lib/components/banners/Banner';
import {
  kFormatter,
  mFormatter,
} from '../../../core/utils/big-number-formatters';

type Props = {
  data: OverlayConfig | undefined;
  mapType: 'barplot' | 'pie';
  numberSelected: number;
};

export const sharedStandaloneMarkerProperties = {
  markerScale: 3,
  containerStyles: {
    width: 'fit-content',
    height: 'fit-content',
    margin: 'auto',
  },
};

export function MarkerPreview({ data, mapType, numberSelected }: Props) {
  if (!data) return <></>;
  if (data.overlayType === 'categorical') {
    const { overlayValues, allValues } = data;
    const showTooManySelectionsOverlay =
      numberSelected > ColorPaletteDefault.length - 1;
    const allOtherValuesCount = allValues.reduce(
      (prev, curr) =>
        prev + (overlayValues.includes(curr.label) ? 0 : curr.count),
      0
    );
    const plotData = overlayValues.map((val, index) => ({
      label: val,
      color: ColorPaletteDefault[index],
      value:
        val === UNSELECTED_TOKEN
          ? allOtherValuesCount
          : allValues.find((v) => v.label === val)?.count ?? 0,
    }));
    if (mapType === 'barplot') {
      return (
        <div
          style={{
            position: 'relative',
          }}
        >
          {showTooManySelectionsOverlay && (
            <TooManySelectionsOverlay numberSelected={numberSelected} />
          )}
          <ChartMarkerStandalone
            data={plotData}
            markerLabel={mFormatter(plotData.reduce((p, c) => p + c.value, 0))}
            {...sharedStandaloneMarkerProperties}
          />
        </div>
      );
    } else if (mapType === 'pie') {
      return (
        <div
          style={{
            position: 'relative',
          }}
        >
          {showTooManySelectionsOverlay && (
            <TooManySelectionsOverlay numberSelected={numberSelected} />
          )}
          <DonutMarkerStandalone
            data={plotData}
            markerLabel={kFormatter(plotData.reduce((p, c) => p + c.value, 0))}
            {...sharedStandaloneMarkerProperties}
          />
        </div>
      );
    } else {
      return null;
    }
  } else {
    return null;
  }
}

function TooManySelectionsOverlay({
  numberSelected,
}: {
  numberSelected: number;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
      }}
    >
      <Banner
        banner={{
          type: 'warning',
          message: (
            <>
              <p style={{ margin: 0 }}>Please select fewer values.</p>
              <p style={{ margin: 0, marginTop: '0.5em' }}>
                Only {ColorPaletteDefault.length - 1} values may be selected.
                You have selected {numberSelected} values.
              </p>
            </>
          ),
          spacing: {
            margin: 0,
          },
        }}
      />
    </div>
  );
}
