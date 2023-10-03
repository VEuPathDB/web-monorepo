// load scatter plot component
import VolcanoPlot, {
  VolcanoPlotProps,
  assignSignificanceColor,
  RawDataMinMaxValues,
} from '@veupathdb/components/lib/plots/VolcanoPlot';

import * as t from 'io-ts';
import { useCallback, useMemo } from 'react';

import { usePromise } from '../../../hooks/promise';
import { useUpdateThumbnailEffect } from '../../../hooks/thumbnails';
import {
  useDataClient,
  useStudyEntities,
  useStudyMetadata,
} from '../../../hooks/workspace';
import { PlotLayout } from '../../layouts/PlotLayout';

import { VisualizationProps } from '../VisualizationTypes';

// concerning axis range control
import { useVizConfig } from '../../../hooks/visualizations';
import { createVisualizationPlugin } from '../VisualizationPlugin';
import LabelledGroup from '@veupathdb/components/lib/components/widgets/LabelledGroup';
import { NumberInput } from '@veupathdb/components/lib/components/widgets/NumberAndDateInputs';

import { LayoutOptions } from '../../layouts/types';
import { RequestOptions } from '../options/types';

// Volcano plot imports
import DataClient, {
  VolcanoPlotRequestParams,
  VolcanoPlotResponse,
} from '../../../api/DataClient';
import {
  VolcanoPlotData,
  VolcanoPlotDataPoint,
  VolcanoPlotStats,
} from '@veupathdb/components/lib/types/plots/volcanoplot';
import VolcanoSVG from './selectorIcons/VolcanoSVG';
import { NumberOrDate } from '@veupathdb/components/lib/types/general';
import { DifferentialAbundanceConfig } from '../../computations/plugins/differentialabundance';
import { yellow } from '@material-ui/core/colors';
import PlotLegend from '@veupathdb/components/lib/components/plotControls/PlotLegend';
import { significanceColors } from '@veupathdb/components/lib/types/plots';
import { NumberOrDateRange, NumberRange } from '../../../types/general';
import { max, min } from 'lodash';

// plot controls
import SliderWidget, {
  plotsSliderOpacityGradientColorSpec,
} from '@veupathdb/components/lib/components/widgets/Slider';
import { ResetButtonCoreUI } from '../../ResetButton';
import AxisRangeControl from '@veupathdb/components/lib/components/plotControls/AxisRangeControl';
import { fixVarIdLabel } from '../../../utils/visualization';
// end imports

const DEFAULT_SIG_THRESHOLD = 0.05;
const DEFAULT_FC_THRESHOLD = 2;
const DEFAULT_MARKER_OPACITY = 0.8;
/**
 * The padding ensures we don't clip off part of the glyphs that represent the most extreme points.
 * We could have also used d3.scale.nice but then we dont have precise control of where the extremes
 * are, which is important for user-defined ranges and truncation bars.
 */
const AXIS_PADDING_FACTOR = 0.05;
const EMPTY_VIZ_AXIS_RANGES = {
  independentAxisRange: { min: -9, max: 9 },
  dependentAxisRange: { min: -1, max: 9 },
};

const plotContainerStyles = {
  width: 750,
  height: 450,
  marginLeft: '0.75rem',
  border: '1px solid #dedede',
  boxShadow: '1px 1px 4px #00000066',
};

export const volcanoPlotVisualization = createVisualizationPlugin({
  selectorIcon: VolcanoSVG,
  fullscreenComponent: VolcanoPlotViz,
  createDefaultConfig: createDefaultConfig,
});

function createDefaultConfig(): VolcanoPlotConfig {
  return {
    effectSizeThreshold: DEFAULT_FC_THRESHOLD,
    significanceThreshold: DEFAULT_SIG_THRESHOLD,
    markerBodyOpacity: DEFAULT_MARKER_OPACITY,
    independentAxisRange: undefined,
    dependentAxisRange: undefined,
  };
}

export type VolcanoPlotConfig = t.TypeOf<typeof VolcanoPlotConfig>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const VolcanoPlotConfig = t.partial({
  effectSizeThreshold: t.number,
  significanceThreshold: t.number,
  markerBodyOpacity: t.number,
  independentAxisRange: NumberRange,
  dependentAxisRange: NumberRange,
});

interface Options
  extends LayoutOptions,
    RequestOptions<VolcanoPlotConfig, {}, VolcanoPlotRequestParams> {}

// Volcano Plot Visualization
// The volcano plot visualization takes no input variables. The received data populates all parts of the plot.
// The user can control the threshold lines, which affect the marker colors. Additional controls
// include axis ranges and marker opacity slider.
function VolcanoPlotViz(props: VisualizationProps<Options>) {
  const {
    options,
    computation,
    visualization,
    updateConfiguration,
    updateThumbnail,
    filters,
    dataElementConstraints,
    dataElementDependencyOrder,
    filteredCounts,
    computeJobStatus,
  } = props;

  const studyMetadata = useStudyMetadata();
  const { id: studyId } = studyMetadata;
  const entities = useStudyEntities(filters);
  const dataClient: DataClient = useDataClient();
  const computationConfiguration: DifferentialAbundanceConfig = computation
    .descriptor.configuration as DifferentialAbundanceConfig;

  const [vizConfig, updateVizConfig] = useVizConfig(
    visualization.descriptor.configuration,
    VolcanoPlotConfig,
    createDefaultConfig,
    updateConfiguration
  );

  // Get the volcano plot data!
  const data = usePromise(
    useCallback(async (): Promise<VolcanoPlotResponse | undefined> => {
      // Only need to check compute job status and filter status, since there are no
      // viz input variables.
      if (computeJobStatus !== 'complete') return undefined;
      if (filteredCounts.pending || filteredCounts.value == null)
        return undefined;

      // There are _no_ viz request params for the volcano plot (config: {}).
      // The data service streams the volcano data directly from the compute service.
      const params = {
        studyId,
        filters,
        config: {},
        computeConfig: computationConfiguration,
      };

      const response = await dataClient.getVisualizationData(
        computation.descriptor.type,
        visualization.descriptor.type,
        params,
        VolcanoPlotResponse
      );

      return response;
    }, [
      computeJobStatus,
      filteredCounts.pending,
      filteredCounts.value,
      filters,
      studyId,
      computationConfiguration,
      computation.descriptor.type,
      dataClient,
      visualization.descriptor.type,
    ])
  );

  /**
   * Find mins and maxes of the data and for the plot.
   * The standard x axis is the log2 fold change. The standard
   * y axis is -log10 raw p value.
   */

  // Find maxes and mins of the data itself
  const rawDataMinMaxValues: RawDataMinMaxValues = useMemo(() => {
    if (!data.value)
      return {
        x: { min: 0, max: 0 },
        y: { min: 1, max: 1 },
      };
    const dataXMin =
      min(data.value.statistics.map((d) => Number(d.effectSize))) ?? 0;
    const dataXMax =
      max(data.value.statistics.map((d) => Number(d.effectSize))) ?? 0;
    const dataYMin =
      min(data.value.statistics.map((d) => Number(d.pValue))) ?? 0;
    const dataYMax =
      max(data.value.statistics.map((d) => Number(d.pValue))) ?? 0;
    return {
      x: { min: dataXMin, max: dataXMax },
      y: { min: dataYMin, max: dataYMax },
    };
  }, [data.value]);

  // Determine mins, maxes of axes in the plot. These are different than the data mins/maxes because
  // of the log transform and the little bit of padding, or because axis ranges are supplied.
  const independentAxisRange = useMemo(() => {
    if (!data.value) return undefined;
    if (vizConfig.independentAxisRange) {
      return vizConfig.independentAxisRange;
    } else {
      const {
        x: { min: dataXMin, max: dataXMax },
      } = rawDataMinMaxValues;
      // We can use the dataMin and dataMax here because we don't have a further transform
      // Add a little padding to prevent clipping the glyph representing the extreme points
      return {
        min: Math.floor(dataXMin - (dataXMax - dataXMin) * AXIS_PADDING_FACTOR),
        max: Math.ceil(dataXMax + (dataXMax - dataXMin) * AXIS_PADDING_FACTOR),
      };
    }
  }, [data.value, vizConfig.independentAxisRange, rawDataMinMaxValues]);

  const dependentAxisRange = useMemo(() => {
    if (!data.value) return undefined;
    if (vizConfig.dependentAxisRange) {
      return vizConfig.dependentAxisRange;
    } else {
      const {
        y: { min: dataYMin, max: dataYMax },
      } = rawDataMinMaxValues;
      // Standard volcano plots have -log10(raw p value) as the y axis
      const yAxisMin = -Math.log10(dataYMax);
      const yAxisMax = -Math.log10(dataYMin);

      // Add a little padding to prevent clipping the glyph representing the extreme points
      return {
        min: Math.floor(yAxisMin - (yAxisMax - yAxisMin) * AXIS_PADDING_FACTOR),
        max: Math.ceil(yAxisMax + (yAxisMax - yAxisMin) * AXIS_PADDING_FACTOR),
      };
    }
  }, [data.value, vizConfig.dependentAxisRange, rawDataMinMaxValues]);

  const significanceThreshold =
    vizConfig.significanceThreshold ?? DEFAULT_SIG_THRESHOLD;
  const effectSizeThreshold =
    vizConfig.effectSizeThreshold ?? DEFAULT_FC_THRESHOLD;

  /**
   * This version of the data will get passed to the VolcanoPlot component
   */
  const finalData = useMemo(() => {
    if (data.value && independentAxisRange && dependentAxisRange) {
      const cleanedData = data.value.statistics
        // Only return data if the points fall within the specified range! Otherwise they'll show up on the plot.
        .filter((d) => {
          const effectSize = Number(d?.effectSize);
          const transformedPValue = -Math.log10(Number(d?.pValue));
          return (
            effectSize <= independentAxisRange.max &&
            effectSize >= independentAxisRange.min &&
            transformedPValue <= dependentAxisRange.max &&
            transformedPValue >= dependentAxisRange.min
          );
        })
        /**
         * Okay, this map function is doing a number of things.
         *  1.  We're going to remove the pointID property and replace it with a pointIDs property that is an array of strings.
         *      Some data share coordinates but correspond to a different pointID. By converting pointID to pointIDs, we can
         *      later aggregate data that share coordinates and then render one tooltip that lists all pointIDs corresponding
         *      to the point on the plot
         *  2.  We also add a significanceColor property that is assigned a value that gets used in VolcanoPlot when rendering
         *      the data point and the data point's tooltip. The property is also used in the countsData logic.
         */
        .map((d) => {
          const { pointID, ...remainingProperties } = d;
          // Try to find a user-friendly label for the point. Note that pointIDs are in entityID.variableID format.
          const displayLabel =
            pointID &&
            fixVarIdLabel(
              pointID.split('.')[1],
              pointID.split('.')[0],
              entities
            );
          return {
            ...remainingProperties,
            pointIDs: pointID ? [pointID] : undefined,
            displayLabels: displayLabel ? [displayLabel] : undefined,
            significanceColor: assignSignificanceColor(
              Number(d.effectSize),
              Number(d.pValue),
              significanceThreshold,
              effectSizeThreshold,
              significanceColors
            ),
          };
        })
        // Sort data in ascending order for tooltips to work most effectively
        .sort((a, b) => Number(a.effectSize) - Number(b.effectSize));

      // Here we're going to loop through the cleanedData to aggregate any data with shared coordinates.
      // For each entry, we'll check if our aggregatedData includes an item with the same coordinates:
      //  Yes? => update the matched aggregatedData element's pointID array to include the pointID of the matching entry
      //  No? => just push the entry onto the aggregatedData array since no match was found
      const aggregatedData: VolcanoPlotStats = [];
      for (const entry of cleanedData) {
        const foundIndex = aggregatedData.findIndex(
          (d: VolcanoPlotDataPoint) =>
            d.effectSize === entry.effectSize && d.pValue === entry.pValue
        );
        if (foundIndex === -1) {
          aggregatedData.push(entry);
        } else {
          const { pointIDs, displayLabels } = aggregatedData[foundIndex];
          if (pointIDs) {
            aggregatedData[foundIndex] = {
              ...aggregatedData[foundIndex],
              pointIDs: [
                ...pointIDs,
                ...(entry.pointIDs ? entry.pointIDs : []),
              ],
              displayLabels: displayLabels && [
                ...displayLabels,
                ...(entry.displayLabels ? entry.displayLabels : []),
              ],
            };
          } else {
            aggregatedData[foundIndex] = {
              ...aggregatedData[foundIndex],
              pointIDs: entry.pointIDs,
              displayLabels: entry.displayLabels,
            };
          }
        }
      }
      return {
        effectSizeLabel: data.value.effectSizeLabel,
        statistics: Object.values(aggregatedData),
      };
    }
  }, [
    data.value,
    independentAxisRange,
    dependentAxisRange,
    significanceThreshold,
    effectSizeThreshold,
    entities,
  ]);

  // For the legend, we need the counts of the data
  const countsData = useMemo(() => {
    if (!finalData) return;
    const counts = {
      [significanceColors['inconclusive']]: 0,
      [significanceColors['high']]: 0,
      [significanceColors['low']]: 0,
    };
    for (const entry of finalData.statistics) {
      if (entry.significanceColor) {
        // Recall that finalData combines data with shared coords into one point in order to display a
        // single tooltip that lists all the pointIDs for that shared point. This means we need to use
        // the length of the pointID array to accurately reflect the counts of unique data (not unique coords).
        const addend = entry.pointIDs?.length ?? 1;
        counts[entry.significanceColor] =
          addend + counts[entry.significanceColor];
      }
    }
    return counts;
  }, [finalData]);

  const plotRef = useUpdateThumbnailEffect(
    updateThumbnail,
    plotContainerStyles,
    [
      finalData,
      // vizConfig.checkedLegendItems, TODO
      vizConfig.independentAxisRange,
      vizConfig.dependentAxisRange,
      vizConfig.markerBodyOpacity,
    ]
  );

  // Add labels to the extremes of the x axis. These may change in the future based on the type
  // of data. For example, for genes we may want to say Up regulated in...
  const comparisonLabels =
    computationConfiguration &&
    computationConfiguration.comparator?.groupA &&
    computationConfiguration.comparator?.groupB
      ? [
          'Up in ' +
            computationConfiguration.comparator.groupA
              .map((entry) => entry.label)
              .join(','),
          'Up in ' +
            computationConfiguration.comparator.groupB
              .map((entry) => entry.label)
              .join(','),
        ]
      : [];

  const volcanoPlotProps: VolcanoPlotProps = {
    /**
     * VolcanoPlot defines an EmptyVolcanoPlotData variable that will be assigned when data is undefined.
     * In order to display an empty viz, EmptyVolcanoPlotData is defined as:
     *    const EmptyVolcanoPlotData: VolcanoPlotData = [{effectSize: '0', pValue: '1'}];
     */
    data: finalData ?? undefined,
    significanceThreshold,
    effectSizeThreshold,
    /**
     * Since we are rendering a single point in order to display an empty viz, let's hide the data point
     * by setting the marker opacity to 0 when data.value doesn't exist
     */
    markerBodyOpacity: data.value
      ? vizConfig.markerBodyOpacity ?? DEFAULT_MARKER_OPACITY
      : 0,
    containerStyles: plotContainerStyles,
    /**
     * Let's not display comparisonLabels before we have data for the viz. This prevents what may be
     * confusing behavior where selecting group values displays on the empty viz placeholder.
     */
    comparisonLabels: data.value ? comparisonLabels : [],
    showSpinner: data.pending,
    truncationBarFill: yellow[300],
    independentAxisRange,
    dependentAxisRange,
    rawDataMinMaxValues,
    /**
     * As sophisticated aesthetes, let's specify axis ranges for the empty viz placeholder
     */
    ...(data.value ? {} : EMPTY_VIZ_AXIS_RANGES),
  };

  // @ts-ignore
  const plotNode = <VolcanoPlot {...volcanoPlotProps} ref={plotRef} />;

  const controlsNode = (
    <div style={{ margin: '1em 1em 2em 1em' }}>
      <LabelledGroup
        label="Plot controls"
        containerStyles={{
          paddingLeft: 0,
        }}
      >
        <SliderWidget
          minimum={0}
          maximum={1}
          step={0.1}
          value={vizConfig.markerBodyOpacity ?? DEFAULT_MARKER_OPACITY}
          debounceRateMs={250}
          onChange={(newValue: number) => {
            updateVizConfig({ markerBodyOpacity: newValue });
          }}
          containerStyles={{ width: '20em', marginTop: '0.5em' }}
          showLimits={true}
          label={'Marker opacity'}
          colorSpec={plotsSliderOpacityGradientColorSpec}
        />
      </LabelledGroup>
      <div
        style={{
          display: 'flex',
          gap: 20,
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <LabelledGroup
              label="X-axis range"
              children={<></>}
              containerStyles={{
                marginRight: 0,
                paddingLeft: 0,
              }}
            />
            <ResetButtonCoreUI
              size={'medium'}
              text={''}
              themeRole={'primary'}
              tooltip={'Reset to defaults'}
              disabled={!vizConfig.independentAxisRange}
              onPress={() =>
                updateVizConfig({ independentAxisRange: undefined })
              }
            />
          </div>
          <AxisRangeControl
            containerStyles={{ maxWidth: '350px' }}
            valueType="number"
            range={independentAxisRange}
            onRangeChange={(newRange?: NumberOrDateRange) => {
              const typeCheckedNewRange =
                typeof newRange?.min === 'number' &&
                typeof newRange?.max === 'number'
                  ? {
                      min: newRange.min,
                      max: newRange.max,
                    }
                  : undefined;
              updateVizConfig({
                independentAxisRange: typeCheckedNewRange,
              });
            }}
            step={0.01}
          />
        </div>
        {/** vertical line to separate x from y range controls */}
        <div style={{ borderRight: '2px solid lightgray' }}></div>
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <LabelledGroup
              label="Y-axis range"
              children={<></>}
              containerStyles={{
                marginRight: 0,
                paddingLeft: 0,
              }}
            />
            <ResetButtonCoreUI
              size={'medium'}
              text={''}
              themeRole={'primary'}
              tooltip={'Reset to defaults'}
              disabled={!vizConfig.dependentAxisRange}
              onPress={() => updateVizConfig({ dependentAxisRange: undefined })}
            />
          </div>
          <AxisRangeControl
            containerStyles={{ maxWidth: '350px' }}
            valueType="number"
            range={dependentAxisRange}
            onRangeChange={(newRange?: NumberOrDateRange) => {
              const typeCheckedNewRange =
                typeof newRange?.min === 'number' &&
                typeof newRange?.max === 'number'
                  ? {
                      min: newRange.min,
                      max: newRange.max,
                    }
                  : undefined;
              updateVizConfig({
                dependentAxisRange: typeCheckedNewRange,
              });
            }}
            step={0.01}
          />
        </div>
      </div>
    </div>
  );

  const legendNode = finalData && countsData && (
    <PlotLegend
      type="list"
      legendTitle="Legend"
      legendItems={[
        {
          label: `Inconclusive (${
            countsData[significanceColors['inconclusive']]
          })`,
          marker: 'circle',
          hasData: true,
          markerColor: significanceColors['inconclusive'],
        },
        {
          label: `Up regulated in ${computationConfiguration.comparator.groupB
            ?.map((entry) => entry.label)
            .join(',')} (${countsData[significanceColors['high']]})`,
          marker: 'circle',
          hasData: true,
          markerColor: significanceColors['high'],
        },
        {
          label: `Up regulated in ${computationConfiguration.comparator.groupA
            ?.map((entry) => entry.label)
            .join(',')} (${countsData[significanceColors['low']]})`,
          marker: 'circle',
          hasData: true,
          markerColor: significanceColors['low'],
        },
      ]}
      showCheckbox={false}
    />
  );

  // TODO
  const tableGroupNode = <> </>;

  const LayoutComponent = options?.layoutComponent ?? PlotLayout;

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <LabelledGroup label="Threshold lines" alignChildrenHorizontally={true}>
        <NumberInput
          onValueChange={(newValue?: NumberOrDate) =>
            updateVizConfig({ effectSizeThreshold: Number(newValue) })
          }
          label={finalData?.effectSizeLabel ?? 'Effect Size'}
          minValue={0}
          value={vizConfig.effectSizeThreshold ?? DEFAULT_FC_THRESHOLD}
          containerStyles={{ marginRight: 10 }}
        />

        <NumberInput
          label="P-Value"
          onValueChange={(newValue?: NumberOrDate) =>
            updateVizConfig({ significanceThreshold: Number(newValue) })
          }
          minValue={0}
          value={vizConfig.significanceThreshold ?? DEFAULT_SIG_THRESHOLD}
          containerStyles={{ marginLeft: 10 }}
          step={0.001}
        />
      </LabelledGroup>

      {/* This should be populated with info from the colections var. So like "Showing 1000 taxa blah". Waiting on collections annotations. */}
      {/* <OutputEntityTitle
        entity={outputEntity}
        outputSize={outputSize}
        subtitle={plotSubtitle}
      /> */}
      <LayoutComponent
        isFaceted={false}
        legendNode={legendNode}
        plotNode={plotNode}
        controlsNode={controlsNode}
        tableGroupNode={tableGroupNode}
        showRequiredInputsPrompt={false}
      />
    </div>
  );
}
