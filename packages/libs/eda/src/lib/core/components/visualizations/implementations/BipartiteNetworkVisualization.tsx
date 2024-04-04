import * as t from 'io-ts';
import { useUpdateThumbnailEffect } from '../../../hooks/thumbnails';
import { VisualizationProps } from '../VisualizationTypes';
import { createVisualizationPlugin } from '../VisualizationPlugin';
import {
  LayoutOptions,
  TitleOptions,
  LegendOptions,
} from '../../layouts/types';
import { RequestOptions } from '../options/types';

// Bipartite network imports
import BipartiteNetwork, {
  BipartiteNetworkProps,
} from '@veupathdb/components/lib/plots/BipartiteNetwork';
import BipartiteNetworkSVG from './selectorIcons/BipartiteNetworkSVG';
import {
  BipartiteNetworkRequestParams,
  CorrelationBipartiteNetworkResponse,
} from '../../../api/DataClient/types';
import { twoColorPalette } from '@veupathdb/components/lib/types/plots/addOns';
import { useCallback, useMemo } from 'react';
import { scaleOrdinal } from 'd3-scale';
import { uniq } from 'lodash';
import { usePromise } from '../../../hooks/promise';
import {
  useDataClient,
  useStudyEntities,
  useStudyMetadata,
} from '../../../hooks/workspace';
import { fixVarIdLabel } from '../../../utils/visualization';
import DataClient from '../../../api/DataClient';
import { OutputEntityTitle } from '../OutputEntityTitle';
import { scaleLinear } from 'd3';
import PlotLegend from '@veupathdb/components/lib/components/plotControls/PlotLegend';
import { LegendItemsProps } from '@veupathdb/components/lib/components/plotControls/PlotListLegend';
import { gray } from '@veupathdb/coreui/lib/definitions/colors';
import '../Visualizations.scss';
import LabelledGroup from '@veupathdb/components/lib/components/widgets/LabelledGroup';
import { NumberInput } from '@veupathdb/components/lib/components/widgets/NumberAndDateInputs';
import { NumberOrDate } from '@veupathdb/components/lib/types/general';
import { useVizConfig } from '../../../hooks/visualizations';
import { FacetedPlotLayout } from '../../layouts/FacetedPlotLayout';
import { H6 } from '@veupathdb/coreui';
import { CorrelationConfig } from '../../../types/apps';
// end imports

// Defaults
const DEFAULT_CORRELATION_COEF_THRESHOLD = 0.5; // Ability for user to change this value not yet implemented.
const DEFAULT_SIGNIFICANCE_THRESHOLD = 0.05; // Ability for user to change this value not yet implemented.
const DEFAULT_LINK_COLOR_DATA = '0';
const MIN_STROKE_WIDTH = 0.5; // Minimum stroke width for links in the network. Will represent the smallest link weight.
const MAX_STROKE_WIDTH = 6; // Maximum stroke width for links in the network. Will represent the largest link weight.
const DEFAULT_NUMBER_OF_LINE_LEGEND_ITEMS = 4;

const plotContainerStyles = {
  width: 1250,
  marginLeft: '0.75rem',
  border: '1px solid #dedede',
  boxShadow: '1px 1px 4px #00000066',
};

export const bipartiteNetworkVisualization = createVisualizationPlugin({
  selectorIcon: BipartiteNetworkSVG,
  fullscreenComponent: BipartiteNetworkViz,
  createDefaultConfig: createDefaultConfig,
});

function createDefaultConfig(): BipartiteNetworkConfig {
  return {
    correlationCoefThreshold: DEFAULT_CORRELATION_COEF_THRESHOLD,
    significanceThreshold: DEFAULT_SIGNIFICANCE_THRESHOLD,
  };
}

export type BipartiteNetworkConfig = t.TypeOf<typeof BipartiteNetworkConfig>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const BipartiteNetworkConfig = t.partial({
  correlationCoefThreshold: t.number,
  significanceThreshold: t.number,
});

interface Options
  extends LayoutOptions,
    TitleOptions,
    LegendOptions,
    RequestOptions<BipartiteNetworkConfig, {}, BipartiteNetworkRequestParams> {}

// Bipartite Network Visualization
// The bipartite network takes no input variables, because the received data will complete the plot.
// Eventually the user will be able to control the significance and correlation coefficient threshold values.
function BipartiteNetworkViz(props: VisualizationProps<Options>) {
  const {
    options,
    computation,
    visualization,
    updateConfiguration,
    updateThumbnail,
    computeJobStatus,
    filteredCounts,
    filters,
    hideInputsAndControls,
    plotContainerStyleOverrides,
  } = props;

  const studyMetadata = useStudyMetadata();
  const { id: studyId } = studyMetadata;
  const entities = useStudyEntities(filters);
  const dataClient: DataClient = useDataClient();

  const computationConfiguration: CorrelationConfig = computation.descriptor
    .configuration as CorrelationConfig;

  const [vizConfig, updateVizConfig] = useVizConfig(
    visualization.descriptor.configuration,
    BipartiteNetworkConfig,
    createDefaultConfig,
    updateConfiguration
  );

  // Get data from the compute job
  const data = usePromise(
    useCallback(async (): Promise<
      CorrelationBipartiteNetworkResponse | undefined
    > => {
      // Only need to check compute job status and filter status, since there are no
      // viz input variables.
      if (computeJobStatus !== 'complete') return undefined;
      if (filteredCounts.pending || filteredCounts.value == null)
        return undefined;

      const params = {
        studyId,
        filters,
        config: {
          correlationCoefThreshold: vizConfig.correlationCoefThreshold,
          significanceThreshold: vizConfig.significanceThreshold,
        },
        computeConfig: computationConfiguration,
      };

      const response = await dataClient.getVisualizationData(
        computation.descriptor.type,
        visualization.descriptor.type,
        params,
        CorrelationBipartiteNetworkResponse
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
      vizConfig.correlationCoefThreshold,
      vizConfig.significanceThreshold,
    ])
  );

  // Determine min and max stroke widths. For use in scaling the strokes (weightToStrokeWidthMap) and the legend.
  const dataWeights =
    data.value?.bipartitenetwork.data.links.map(
      (link) => Number(link.weight) // link.weight will always be a number if defined, because it represents the continuous data associated with that link.
    ) ?? [];
  // Use Set to dedupe the array of dataWeights
  const uniqueDataWeights = Array.from(new Set(dataWeights));
  const minDataWeight = Math.min(...uniqueDataWeights);
  const maxDataWeight = Math.max(...uniqueDataWeights);

  // Clean and finalize data format. Specifically, assign link colors, add display labels
  const cleanedData = useMemo(() => {
    if (!data.value) return undefined;

    // Create map that will adjust each link's weight to find a stroke width that spans an appropriate range for this viz.
    const weightToStrokeWidthMap = scaleLinear()
      .domain([minDataWeight, maxDataWeight])
      .range([MIN_STROKE_WIDTH, MAX_STROKE_WIDTH]);

    // Assign color to links.
    // Color palettes live here in the frontend, but the backend decides how to color links (ex. by sign of correlation, or avg degree of parent nodes).
    // So we'll make assigning colors generalizable by mapping the values of the links.color prop to the palette. As we add
    // different ways to color links in the future, we can adapt our checks and error messaging.
    const uniqueLinkColors = uniq(
      data.value?.bipartitenetwork.data.links.map(
        (link) => link.color?.toString() ?? DEFAULT_LINK_COLOR_DATA
      )
    );
    if (uniqueLinkColors.length > twoColorPalette.length) {
      throw new Error(
        `Found ${uniqueLinkColors.length} link colors but expected only ${twoColorPalette.length}.`
      );
    }
    // The link color sent from the backend should be either '-1' or '1', but we'll allow any two unique values. Assigning the domain
    // in the following way preserves "1" getting mapped to the second color in the palette, even if it's the only
    // unique value in uniqueLinkColors.
    const linkColorScaleDomain = uniqueLinkColors.every((val) =>
      ['-1', '1'].includes(val)
    )
      ? ['-1', '1']
      : uniqueLinkColors;
    const linkColorScale = scaleOrdinal<string>()
      .domain(linkColorScaleDomain)
      .range(twoColorPalette); // the output palette may change if this visualization is reused in other contexts (ex. not a correlation app).

    // Find display labels
    const nodesWithLabels = data.value.bipartitenetwork.data.nodes.map(
      (node) => {
        // node.id is the entityId.variableId
        const displayLabel = fixVarIdLabel(
          node.id.split('.')[1],
          node.id.split('.')[0],
          entities
        );

        return {
          id: node.id,
          label: displayLabel,
        };
      }
    );

    return {
      ...data.value.bipartitenetwork.data,
      nodes: nodesWithLabels,
      links: data.value.bipartitenetwork.data.links.map((link) => {
        return {
          source: link.source,
          target: link.target,
          strokeWidth: weightToStrokeWidthMap(Number(link.weight)),
          color: link.color ? linkColorScale(link.color.toString()) : '#000000',
        };
      }),
    };
  }, [data.value, entities, minDataWeight, maxDataWeight]);

  // plot subtitle
  const plotSubtitle =
    'Showing links with an absolute correlation coefficient above ' +
    vizConfig.correlationCoefThreshold?.toString() +
    ' and a p-value below ' +
    vizConfig.significanceThreshold?.toString();

  const finalPlotContainerStyles = useMemo(
    () => ({
      ...plotContainerStyles,
      ...plotContainerStyleOverrides,
    }),
    [plotContainerStyleOverrides]
  );

  // These styles affect the network plot and will override the containerStyles if necessary (for example, width).
  const bipartiteNetworkSVGStyles = {
    columnPadding: 300,
  };

  const plotRef = useUpdateThumbnailEffect(
    updateThumbnail,
    {
      ...finalPlotContainerStyles,
      height: 400, // no reason for the thumbnail to be as tall as the network (which could be very, very tall!)
    },
    [cleanedData]
  );

  // Have the bpnet component say "No nodes" or whatev and have an extra
  // prop called errorMessage or something that displays when there are no nodes.
  // that error message can say "your thresholds of blah and blah are too high, change them"
  const emptyNetworkContent = (
    <div
      style={{
        height: 400,
        textAlign: 'center',
        top: '50%',
        transform: 'translateY(40%)',
      }}
    >
      <H6>No correlation results pass the configured thresholds.</H6>
      <br />
      <br />
      Adjust the correlation coefficient and p-value thresholds to continue.
    </div>
  );

  const bipartiteNetworkProps: BipartiteNetworkProps = {
    data: cleanedData ?? undefined,
    showSpinner: data.pending,
    containerStyles: finalPlotContainerStyles,
    svgStyleOverrides: bipartiteNetworkSVGStyles,
    labelTruncationLength: 40,
    emptyNetworkContent,
  };

  const plotNode = (
    //@ts-ignore
    <BipartiteNetwork {...bipartiteNetworkProps} ref={plotRef} />
  );

  const controlsNode = <> </>;

  // Create legend for (1) Line/link thickness and (2) Link color.
  // For (1), we'll do the following:
  //  - create a base array that is conditioned on the length of uniqueDataWeights since uniqueDataWeights is a deduped map of ALL data.links.weight
  //    -- if uniqueDataWeights.length is less than or equal to 4, let's use uniqueDataWeights as our base array sorted from greatest to least
  //    -- if uniqueDataWeights.length is greater than 4, create an array of a default length filled with 'undefined'
  //  - create lineLegendItems by mapping over lineLegendItemsBaseArray
  //    -- if the element (weight) is truthy, then we know we're dealing with a copy of the uniqueDataWeights array and can use this value for weightLabel
  //    -- if the element is falsy, fall back to previous calculation for weightLabel
  const lineLegendItemsBaseArray =
    uniqueDataWeights.length <= 4
      ? [...uniqueDataWeights].sort((a, b) => b - a)
      : Array(DEFAULT_NUMBER_OF_LINE_LEGEND_ITEMS).fill(undefined);
  const lineLegendItems: LegendItemsProps[] = lineLegendItemsBaseArray.map(
    (weight, index) => {
      const weightLabel =
        weight ??
        maxDataWeight -
          ((maxDataWeight - minDataWeight) /
            (lineLegendItemsBaseArray.length - 1)) *
            index;
      return {
        label: String(weightLabel.toFixed(4)),
        marker: 'line',
        markerColor: gray[900],
        hasData: true,
        lineThickness:
          String(
            MAX_STROKE_WIDTH -
              ((MAX_STROKE_WIDTH - MIN_STROKE_WIDTH) /
                (lineLegendItemsBaseArray.length - 1)) *
                index
          ) + 'px',
      };
    }
  );

  const lineLegendTitle = options?.getLegendTitle?.(
    computation.descriptor.configuration
  )
    ? 'Link width (' +
      options.getLegendTitle(computation.descriptor.configuration)[0] +
      ')'
    : 'Link width';

  const colorLegendTitle = options?.getLegendTitle?.(
    computation.descriptor.configuration
  )
    ? 'Link color (' +
      options.getLegendTitle(computation.descriptor.configuration)[1] +
      ')'
    : 'Link color';

  const colorLegendItems: LegendItemsProps[] = [
    {
      label: 'Positive',
      marker: 'line',
      markerColor: twoColorPalette[1],
      hasData: true,
      lineThickness: '3px',
    },
    {
      label: 'Negative',
      marker: 'line',
      markerColor: twoColorPalette[0],
      hasData: true,
      lineThickness: '3px',
    },
  ];

  const legendNode = cleanedData && cleanedData.nodes.length > 0 && (
    <div className="MultiLegendContaner">
      <PlotLegend
        type="list"
        legendItems={lineLegendItems}
        checkedLegendItems={undefined}
        legendTitle={lineLegendTitle}
        showCheckbox={false}
      />
      <PlotLegend
        type="list"
        legendItems={colorLegendItems}
        checkedLegendItems={undefined}
        legendTitle={colorLegendTitle}
        showCheckbox={false}
      />
    </div>
  );
  const tableGroupNode = <> </>;

  // The bipartite network uses FacetedPlotLayout in order to position the legends
  // atop the plot. The bipartite network plots are often so tall and so wide that
  // with the normal PlotLayout component the legends are forced way, way down the screen
  // below the plot.
  const LayoutComponent = options?.layoutComponent ?? FacetedPlotLayout;

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {!hideInputsAndControls && (
        <LabelledGroup label="Link thresholds" alignChildrenHorizontally={true}>
          <NumberInput
            onValueChange={(newValue?: NumberOrDate) =>
              updateVizConfig({ correlationCoefThreshold: Number(newValue) })
            }
            label={'Absolute correlation coefficient'}
            minValue={0}
            maxValue={1}
            value={
              vizConfig.correlationCoefThreshold ??
              DEFAULT_CORRELATION_COEF_THRESHOLD
            }
            step={0.05}
            applyWarningStyles={cleanedData && cleanedData.nodes.length === 0}
          />

          <NumberInput
            label="P-Value"
            onValueChange={(newValue?: NumberOrDate) =>
              updateVizConfig({ significanceThreshold: Number(newValue) })
            }
            minValue={0}
            maxValue={1}
            value={
              vizConfig.significanceThreshold ?? DEFAULT_SIGNIFICANCE_THRESHOLD
            }
            containerStyles={{ marginLeft: 10 }}
            step={0.001}
            applyWarningStyles={cleanedData && cleanedData.nodes.length === 0}
          />
        </LabelledGroup>
      )}
      <OutputEntityTitle subtitle={plotSubtitle} />
      <LayoutComponent
        legendNode={legendNode}
        plotNode={plotNode}
        controlsNode={controlsNode}
        tableGroupNode={tableGroupNode}
        plotStyles={{ width: 'auto' }}
        containerStyles={{ flexDirection: 'column' }}
      />
    </div>
  );
}
