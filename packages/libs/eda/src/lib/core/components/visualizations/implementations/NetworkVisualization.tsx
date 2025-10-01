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

// Network imports
import NetworkPlot, {
  NetworkPlotProps,
} from '@veupathdb/components/lib/plots/NetworkPlot';
import NetworkSVG from './selectorIcons/NetworkSVG';
import {
  NetworkResponse,
  NetworkRequestParams,
} from '../../../api/DataClient/types';
import { twoColorPalette } from '@veupathdb/components/lib/types/plots/addOns';
import { useCallback, useMemo, useState } from 'react';
import { scaleOrdinal } from 'd3-scale';
import { capitalize, uniq } from 'lodash';
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
import { LabelPosition } from '@veupathdb/components/lib/plots/Node';
import MultiSelect, {
  Option as NodeLabelProp,
} from '@veupathdb/components/lib/components/plotControls/MultiSelect';
import { ResetButtonCoreUI } from '../../ResetButton';
import RadioButtonGroup from '@veupathdb/components/lib/components/widgets/RadioButtonGroup';
// end imports

// Defaults
const DEFAULT_CORRELATION_COEF_THRESHOLD = 0.5; // Ability for user to change this value not yet implemented.
const DEFAULT_SIGNIFICANCE_THRESHOLD = 0.05; // Ability for user to change this value not yet implemented.
const DEFAULT_LINK_TYPE = 'Both'; // Correlation direction. Applies to correlation networks only.
const DEFAULT_LINK_COLOR_DATA = '0';
const MIN_STROKE_WIDTH = 0.5; // Minimum stroke width for links in the network. Will represent the smallest link weight.
const MAX_STROKE_WIDTH = 6; // Maximum stroke width for links in the network. Will represent the largest link weight.
const DEFAULT_NUMBER_OF_LINE_LEGEND_ITEMS = 4;

const plotContainerStyles = {
  width: 900,
  height: 800,
  marginLeft: '0.75rem',
  border: '1px solid #dedede',
  boxShadow: '1px 1px 4px #00000066',
};

export const networkVisualization = createVisualizationPlugin({
  selectorIcon: NetworkSVG, // Placeholder for now until ann has created a new one!
  fullscreenComponent: NetworkViz,
  createDefaultConfig: createDefaultConfig,
});

function createDefaultConfig(): NetworkConfig {
  return {
    correlationCoefThreshold: DEFAULT_CORRELATION_COEF_THRESHOLD,
    significanceThreshold: DEFAULT_SIGNIFICANCE_THRESHOLD,
    correlationDirection:
      DEFAULT_LINK_TYPE.toLowerCase() as NetworkCorrelationDirection,
  };
}

export const NetworkCorrelationDirection = t.union([
  t.literal('positive'),
  t.literal('negative'),
  t.literal('both'),
]);
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type NetworkCorrelationDirection = t.TypeOf<
  typeof NetworkCorrelationDirection
>;

export type NetworkConfig = t.TypeOf<typeof NetworkConfig>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const NetworkConfig = t.partial({
  correlationCoefThreshold: t.number,
  significanceThreshold: t.number,
  correlationDirection: NetworkCorrelationDirection,
});

interface Options
  extends LayoutOptions,
    TitleOptions,
    LegendOptions,
    RequestOptions<NetworkConfig, {}, NetworkRequestParams> {}

// Network Visualization
// The network takes no input variables, because the received data will complete the plot.
// The user can control the significance and correlation coefficient threshold values.
function NetworkViz(props: VisualizationProps<Options>) {
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
    NetworkConfig,
    createDefaultConfig,
    updateConfiguration
  );

  // Get data from the compute job
  const data = usePromise(
    useCallback(async (): Promise<NetworkResponse | undefined> => {
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
          correlationDirection: vizConfig.correlationDirection,
        },
        computeConfig: computationConfiguration,
      };

      const response = await dataClient.getVisualizationData(
        computation.descriptor.type,
        visualization.descriptor.type,
        params,
        NetworkResponse
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
      vizConfig.correlationDirection,
    ])
  );

  // Determine min and max stroke widths. For use in scaling the strokes (weightToStrokeWidthMap) and the legend.
  const dataWeights =
    data.value?.network.data.links.map(
      (link) => Number(link.weight) // link.weight will always be a number if defined, because it represents the continuous data associated with that link.
    ) ?? [];
  // Use Set to deduplicate the array of dataWeights
  const uniqueDataWeights = Array.from(new Set(dataWeights));
  const minDataWeight = Math.min(...uniqueDataWeights);
  const maxDataWeight = Math.max(...uniqueDataWeights);

  // Determine min and max x and y positions for nodes. For use later in scaling the node positions to fit.
  const dataXPositions =
    data.value?.network.data.nodes.map((node) => Number(node.x)) ?? [];
  const dataYPositions =
    data.value?.network.data.nodes.map((node) => Number(node.y)) ?? [];
  const minXPosition = Math.min(...dataXPositions);
  const maxXPosition = Math.max(...dataXPositions);
  const minYPosition = Math.min(...dataYPositions);
  const maxYPosition = Math.max(...dataYPositions);

  // for node label control
  const [visibleNodeLabels, setVisibleNodeLabels] = useState<
    NodeLabelProp[] | undefined
  >([]);

  // check/uncheck node label control
  const handleChange = (selected: NodeLabelProp[]) => {
    setVisibleNodeLabels(selected);
  };

  // Clean and finalize data format. Specifically, assign link colors, add display labels
  const cleanedData = useMemo(() => {
    if (!data.value) return undefined;

    // Note that after applying a buffer of 150px/100px to the x/y scales, the plot size should be a sqare!
    // For example, if plotContainerStyles.width=900 and plotContainerStyles.height=800, the scaled network will span 600x600.
    const scaleX = scaleLinear()
      .domain([minXPosition, maxXPosition])
      .range([150, plotContainerStyles.width - 150]); // Add a little extra room in the x direction to accound for labels.
    const scaleY = scaleLinear()
      .domain([minYPosition, maxYPosition])
      .range([100, plotContainerStyles.height - 100]);

    // Create map that will adjust each link's weight to find a stroke width that spans an appropriate range for this viz.
    const weightToStrokeWidthMap = scaleLinear()
      .domain([minDataWeight, maxDataWeight])
      .range([MIN_STROKE_WIDTH, MAX_STROKE_WIDTH]);

    // Assign color to links.
    // Color palettes live here in the frontend, but the backend decides how to color links (ex. by sign of correlation, or avg degree of parent nodes).
    // So we'll make assigning colors generalizable by mapping the values of the links.color prop to the palette. As we add
    // different ways to color links in the future, we can adapt our checks and error messaging.
    const uniqueLinkColors = uniq(
      data.value?.network.data.links.map(
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
    const nodesWithLabels = data.value.network.data.nodes.map((node) => {
      // node.id is the entityId.variableId
      const displayLabel = fixVarIdLabel(
        node.id.split('.')[1],
        node.id.split('.')[0],
        entities
      );

      return {
        ...node,
        x: scaleX(Number(node.x)),
        y: scaleY(Number(node.y)),
        id: node.id,
        label: displayLabel,
        // the following attempts to place the label in a "reasonable" position
        // on the plot. So if a node is far on the left side, the label will be on the left side.
        // This simple solution attempts to avoid overlapping labels and give us a cheap, clean-ish plot.
        labelPosition:
          scaleX(Number(node.x)) >
          (plotContainerStyleOverrides?.width ?? 900) / 2
            ? 'right'
            : ('left' as LabelPosition),
      };
    });

    // set initial visible node labels
    const defaultNodeLabels = nodesWithLabels.flatMap((node) => {
      return { value: node.label, label: node.label };
    });

    setVisibleNodeLabels(defaultNodeLabels);

    return {
      ...data.value.network.data,
      nodes: nodesWithLabels,
      links: data.value.network.data.links.map((link) => {
        return {
          source: { id: link.source },
          target: { id: link.target },
          strokeWidth: weightToStrokeWidthMap(Number(link.weight)),
          color: link.color ? linkColorScale(link.color.toString()) : '#000000',
        };
      }),
    };
  }, [
    data.value,
    entities,
    minDataWeight,
    maxDataWeight,
    maxXPosition,
    minXPosition,
    maxYPosition,
    minYPosition,
    plotContainerStyleOverrides?.width,
  ]);

  // plot subtitle
  const plotSubtitle = (
    <div>
      <p>
        {`Showing links with an absolute correlation coefficient above ${vizConfig.correlationCoefThreshold?.toString()} and a p-value below ${vizConfig.significanceThreshold?.toString()}. Network layout computed using the igraph layout_nicely function.`}
      </p>
      <p>Click on a node to highlight its edges.</p>
    </div>
  );

  const finalPlotContainerStyles = useMemo(
    () => ({
      ...plotContainerStyles,
      ...plotContainerStyleOverrides,
    }),
    [plotContainerStyleOverrides]
  );

  const plotRef = useUpdateThumbnailEffect(
    updateThumbnail,
    {
      ...finalPlotContainerStyles,
      height: 400,
    },
    [cleanedData]
  );

  // Content for the Network component to display when no nodes
  // pass the correlation coeff and significance thresholds
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

  // for the list of node labels with checkboxes
  const nodeLabels: NodeLabelProp[] | undefined = useMemo(() => {
    return cleanedData != null
      ? cleanedData.nodes.flatMap((node) => {
          return { value: node.label, label: node.label };
        })
      : undefined;
  }, [cleanedData]);

  const networkPlotProps: NetworkPlotProps = {
    nodes: cleanedData ? cleanedData.nodes : undefined,
    links: cleanedData ? cleanedData.links : undefined,
    showSpinner: data.pending,
    containerStyles: finalPlotContainerStyles,
    labelTruncationLength: 30,
    emptyNetworkContent,
    // pass visible node labels
    visibleNodeLabels: visibleNodeLabels,
  };

  const plotNode = (
    //@ts-ignore
    <NetworkPlot {...networkPlotProps} ref={plotRef} />
  );

  // node label control
  const controlsNode = (
    <>
      {nodeLabels != null && (
        <div
          style={{
            width: plotContainerStyles.width,
            display: 'flex',
          }}
        >
          <LabelledGroup
            label={
              <div css={{ display: 'flex', alignItems: 'center' }}>
                Network controls
                <ResetButtonCoreUI
                  size={'medium'}
                  text={''}
                  themeRole={'primary'}
                  tooltip={'Reset'}
                  disabled={false}
                  onPress={(e) => setVisibleNodeLabels(nodeLabels)}
                />
              </div>
            }
          >
            <div
              style={{
                marginTop: '0.5em',
                marginBottom: '0.5em',
                fontSize: '1em',
                fontWeight: 600,
              }}
            >
              Visible Node Labels
            </div>
            <MultiSelect
              key="network_multi_select_labels"
              options={nodeLabels}
              onChange={handleChange}
              value={visibleNodeLabels}
              isSelectAll={true}
              menuPlacement={'auto'}
            />
          </LabelledGroup>
        </div>
      )}
    </>
  );

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

  // The network uses FacetedPlotLayout in order to position the legends
  // atop the plot. The network plots are often so tall and so wide that
  // with the normal PlotLayout component the legends are forced way, way down the screen
  // below the plot.
  const LayoutComponent = options?.layoutComponent ?? FacetedPlotLayout;

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {!hideInputsAndControls && (
        <div style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
          <LabelledGroup
            label="Link thresholds"
            alignChildrenHorizontally={true}
          >
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
                vizConfig.significanceThreshold ??
                DEFAULT_SIGNIFICANCE_THRESHOLD
              }
              containerStyles={{ marginLeft: 10 }}
              step={0.001}
              applyWarningStyles={cleanedData && cleanedData.nodes.length === 0}
            />
          </LabelledGroup>
          <LabelledGroup label="Link type" alignChildrenHorizontally={true}>
            <RadioButtonGroup
              options={['Positive', 'Negative', 'Both']}
              selectedOption={
                capitalize(vizConfig.correlationDirection) ?? DEFAULT_LINK_TYPE
              }
              onOptionSelected={(value) => {
                const validatedValue = NetworkCorrelationDirection.decode(
                  value.toLowerCase()
                );
                if (validatedValue._tag === 'Right') {
                  updateVizConfig({
                    correlationDirection: validatedValue.right,
                  });
                } else {
                  console.error('Invalid link type');
                }
              }}
            />
          </LabelledGroup>
        </div>
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
