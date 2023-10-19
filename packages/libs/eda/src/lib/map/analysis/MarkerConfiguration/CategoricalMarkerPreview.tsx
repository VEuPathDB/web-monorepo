import { AllValuesDefinition, OverlayConfig } from '../../../core';
import { ColorPaletteDefault } from '@veupathdb/components/lib/types/plots';
import {
  ChartMarkerStandalone,
  getChartMarkerDependentAxisRange,
} from '@veupathdb/components/lib/map/ChartMarker';
import { DonutMarkerStandalone } from '@veupathdb/components/lib/map/DonutMarker';
import { UNSELECTED_TOKEN } from '../../constants';
import Banner from '@veupathdb/coreui/lib/components/banners/Banner';
import {
  kFormatter,
  mFormatter,
} from '../../../core/utils/big-number-formatters';
import { MAXIMUM_ALLOWABLE_VALUES } from './CategoricalMarkerConfigurationTable';

type Props = {
  overlayConfiguration: OverlayConfig | undefined;
  mapType: 'barplot' | 'pie';
  numberSelected: number;
  allFilteredCategoricalValues: AllValuesDefinition[] | undefined;
  isDependentAxisLogScaleActive?: boolean;
};

export const sharedStandaloneMarkerProperties = {
  markerScale: 2.5,
  containerStyles: {
    width: 'fit-content',
    height: 'fit-content',
    margin: 'auto',
  },
};

export function CategoricalMarkerPreview({
  overlayConfiguration,
  allFilteredCategoricalValues,
  mapType,
  numberSelected,
  isDependentAxisLogScaleActive = false,
}: Props) {
  if (!overlayConfiguration || !allFilteredCategoricalValues) return <></>;
  if (overlayConfiguration.overlayType === 'categorical') {
    const { overlayValues } = overlayConfiguration;

    const showTooManySelectionsOverlay =
      overlayValues.includes(UNSELECTED_TOKEN) &&
      numberSelected > MAXIMUM_ALLOWABLE_VALUES;
    /**
     * When overlayValues includes UNSELECTED_TOKEN, numberSelected will be calculated with the inclusion of UNSELECTED_TOKEN.
     * Since UNSELECTED_TOKEN is not user-generated, we subtract 1 to indicate the actual number of values the user can select.
     */
    const adjustedNumberSelected = overlayValues.includes(UNSELECTED_TOKEN)
      ? numberSelected - 1
      : numberSelected;
    const tooManySelectionsOverlay = showTooManySelectionsOverlay ? (
      <TooManySelectionsOverlay numberSelected={adjustedNumberSelected} />
    ) : null;

    const allOtherValuesCount = allFilteredCategoricalValues.reduce(
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
          : allFilteredCategoricalValues.find((v) => v.label === val)?.count ??
            0,
    }));
    if (mapType === 'barplot') {
      const dependentAxisRange = getChartMarkerDependentAxisRange(
        plotData,
        isDependentAxisLogScaleActive
      );
      return (
        <div
          style={{
            position: 'relative',
          }}
        >
          {tooManySelectionsOverlay}
          <ChartMarkerStandalone
            data={plotData}
            markerLabel={mFormatter(plotData.reduce((p, c) => p + c.value, 0))}
            dependentAxisLogScale={isDependentAxisLogScaleActive}
            // pass in an axis range to mimic map markers, especially in log scale
            dependentAxisRange={dependentAxisRange}
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
          {tooManySelectionsOverlay}
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
                {/**
                 * MAXIMUM_ALLOWABLE_VALUES is derived by the color palette and the color palette saves space for
                 * the UNSELECTED_TOKEN, hence the user can only select 1 less than the max.
                 */}
                Only {MAXIMUM_ALLOWABLE_VALUES - 1} values may be selected. You
                have selected {numberSelected} values.
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
