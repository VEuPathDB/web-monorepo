// load scatter plot component
import VolcanoPlot, {
  VolcanoPlotProps,
  assignSignificanceColor,
  RawDataMinMaxValues,
} from '@veupathdb/components/lib/plots/VolcanoPlot';

import * as t from 'io-ts';
import { useCallback, useState, useMemo } from 'react';

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
import VolcanoSVG from './selectorIcons/VolcanoSVG';
import { NumberOrDate } from '@veupathdb/components/lib/types/general';
import { DifferentialAbundanceConfig } from '../../computations/plugins/differentialabundance';
import { yellow } from '@material-ui/core/colors';
import PlotLegend from '@veupathdb/components/lib/components/plotControls/PlotLegend';
import { significanceColors } from '@veupathdb/components/lib/types/plots';
import { NumberRange } from '../../../types/general';
import { max, min } from 'lodash';
// end imports

const DEFAULT_SIG_THRESHOLD = 0.05;
const DEFAULT_FC_THRESHOLD = 2;
/**
 * The padding ensures we don't clip off part of the glyphs that represent the most extreme points.
 * We could have also used d3.scale.nice but then we dont have precise control of where the extremes
 * are, which is important for user-defined ranges and truncation bars.
 */
const AXIS_PADDING_FACTOR = 0.05;

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
    log2FoldChangeThreshold: DEFAULT_FC_THRESHOLD,
    significanceThreshold: DEFAULT_SIG_THRESHOLD,
    markerBodyOpacity: 0.5,
  };
}

export type VolcanoPlotConfig = t.TypeOf<typeof VolcanoPlotConfig>;

export const VolcanoPlotConfig = t.partial({
  log2FoldChangeThreshold: t.number,
  significanceThreshold: t.number,
  markerBodyOpacity: t.number,
});

interface Options
  extends LayoutOptions,
    RequestOptions<VolcanoPlotConfig, {}, VolcanoPlotRequestParams> {}

// Volcano Plot Visualization
// The volcano plot visualization takes no input variables. The received data populates all parts of the plot.
// The user can control the threshold lines, which affect the marker colors. Additional controls
// will include axis ranges.
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
      entities,
      dataElementConstraints,
      dataElementDependencyOrder,
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
        y: { min: 0, max: 0 },
      };
    const dataXMin = min(data.value.map((d) => Number(d.log2foldChange))) ?? 0;
    const dataXMax = max(data.value.map((d) => Number(d.log2foldChange))) ?? 0;
    const dataYMin = min(data.value.map((d) => Number(d.pValue))) ?? 0;
    const dataYMax = max(data.value.map((d) => Number(d.pValue))) ?? 0;
    return {
      x: { min: dataXMin, max: dataXMax },
      y: { min: dataYMin, max: dataYMax },
    };
  }, [data.value]);

  // Determine mins, maxes of axes in the plot. These are different than the data mins/maxes because
  // of the log transform and the little bit of padding, or because axis ranges are supplied.
  // NOTE: this state may be unnecessary depending on how we implement user-controlled axis ranges
  const [xAxisRange, setXAxisRange] =
    useState<NumberRange | undefined>(undefined);
  const independentAxisRange = useMemo(() => {
    if (!data.value) return undefined;
    if (xAxisRange) {
      return xAxisRange;
    } else {
      const {
        x: { min: dataXMin, max: dataXMax },
      } = rawDataMinMaxValues;
      if (dataXMin && dataXMax) {
        // We can use the dataMin and dataMax here because we don't have a further transform
        // Add a little padding to prevent clipping the glyph representing the extreme points
        return {
          min: dataXMin - (dataXMax - dataXMin) * AXIS_PADDING_FACTOR,
          max: dataXMax + (dataXMax - dataXMin) * AXIS_PADDING_FACTOR,
        };
      } else {
        return { min: 0, max: 0 };
      }
    }
  }, [data.value, xAxisRange, rawDataMinMaxValues]);

  // NOTE: this state may be unnecessary depending on how we implement user-controlled axis ranges
  const [yAxisRange, setYAxisRange] =
    useState<NumberRange | undefined>(undefined);
  const dependentAxisRange = useMemo(() => {
    if (!data.value) return undefined;
    if (yAxisRange) {
      return yAxisRange;
    } else {
      const {
        y: { min: dataYMin, max: dataYMax },
      } = rawDataMinMaxValues;
      if (dataYMin && dataYMax) {
        // Standard volcano plots have -log10(raw p value) as the y axis
        const yAxisMin = -Math.log10(dataYMax);
        const yAxisMax = -Math.log10(dataYMin);
        // Add a little padding to prevent clipping the glyph representing the extreme points
        return {
          min: yAxisMin - (yAxisMax - yAxisMin) * AXIS_PADDING_FACTOR,
          max: yAxisMax + (yAxisMax - yAxisMin) * AXIS_PADDING_FACTOR,
        };
      } else {
        return { min: 0, max: 0 };
      }
    }
  }, [data.value, yAxisRange, rawDataMinMaxValues]);

  const significanceThreshold =
    vizConfig.significanceThreshold ?? DEFAULT_SIG_THRESHOLD;
  const log2FoldChangeThreshold =
    vizConfig.log2FoldChangeThreshold ?? DEFAULT_FC_THRESHOLD;

  /**
   * Let's filter out data that falls outside of the plot axis ranges and then
   * assign a significance color to the visible data
   * This version of the data will get passed to the VolcanoPlot component
   */
  const finalData = useMemo(() => {
    if (data.value && independentAxisRange && dependentAxisRange) {
      // Only return data if the points fall within the specified range! Otherwise they'll show up on the plot.
      return data.value
        .filter((d) => {
          const log2foldChange = Number(d?.log2foldChange);
          const transformedPValue = -Math.log10(Number(d?.pValue));
          return (
            log2foldChange <= independentAxisRange.max &&
            log2foldChange >= independentAxisRange.min &&
            transformedPValue <= dependentAxisRange.max &&
            transformedPValue >= dependentAxisRange.min
          );
        })
        .map((d) => ({
          ...d,
          significanceColor: assignSignificanceColor(
            Number(d.log2foldChange),
            Number(d.pValue),
            significanceThreshold,
            log2FoldChangeThreshold,
            significanceColors
          ),
        }));
    }
  }, [
    data.value,
    independentAxisRange,
    dependentAxisRange,
    significanceThreshold,
    log2FoldChangeThreshold,
    significanceColors,
  ]);

  // TODO: Given that I cannot figure out how to type this correctly, I suspect there's a simpler, cleaner
  // way to get the counts.
  const countsData = useMemo(() => {
    if (!finalData) return;
    return finalData.reduce(
      (prev: any, curr: any) => {
        if (curr.significanceColor) {
          return {
            ...prev,
            [curr.significanceColor]: ++prev[curr.significanceColor],
          };
        }
      },
      {
        [significanceColors['inconclusive']]: 0,
        [significanceColors['high']]: 0,
        [significanceColors['low']]: 0,
      }
    );
  }, [finalData, significanceColors]);

  const plotRef = useUpdateThumbnailEffect(
    updateThumbnail,
    plotContainerStyles,
    [
      data,
      // vizConfig.checkedLegendItems, TODO
      // vizConfig.independentAxisRange, TODO
      // vizConfig.dependentAxisRange, TODO
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
          'Up in ' + computationConfiguration.comparator.groupA.join(', '),
          'Up in ' + computationConfiguration.comparator.groupB.join(', '),
        ]
      : [];

  const volcanoPlotProps: VolcanoPlotProps = {
    data: finalData ? Object.values(finalData) : [],
    markerBodyOpacity: vizConfig.markerBodyOpacity ?? 0.5,
    significanceThreshold,
    log2FoldChangeThreshold,
    containerStyles: plotContainerStyles,
    comparisonLabels: comparisonLabels,
    showSpinner: data.pending,
    truncationBarFill: yellow[300],
    independentAxisRange,
    dependentAxisRange,
    rawDataMinMaxValues,
  };

  // @ts-ignore
  const plotNode = <VolcanoPlot {...volcanoPlotProps} ref={plotRef} />;

  // TODO
  const controlsNode = <> </>;

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
          label: `Up regulated in ${computationConfiguration.comparator.groupB?.join(
            ', '
          )} (${countsData[significanceColors['high']]})`,
          marker: 'circle',
          hasData: true,
          markerColor: significanceColors['high'],
        },
        {
          label: `Up regulated in ${computationConfiguration.comparator.groupA?.join(
            ', '
          )} (${countsData[significanceColors['low']]})`,
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
      <LabelledGroup label="Threshold lines">
        <NumberInput
          onValueChange={(newValue?: NumberOrDate) =>
            updateVizConfig({ log2FoldChangeThreshold: Number(newValue) })
          }
          label="log2(Fold Change)"
          minValue={0}
          value={vizConfig.log2FoldChangeThreshold ?? DEFAULT_FC_THRESHOLD}
          containerStyles={{ flex: 1 }}
        />

        <NumberInput
          label="P-Value"
          onValueChange={(newValue?: NumberOrDate) =>
            updateVizConfig({ significanceThreshold: Number(newValue) })
          }
          minValue={0}
          value={vizConfig.significanceThreshold ?? DEFAULT_SIG_THRESHOLD}
          containerStyles={{ flex: 1 }}
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
