// load scatter plot component
import VolcanoPlot, {
  VolcanoPlotProps,
} from '@veupathdb/components/lib/plots/VolcanoPlot';

import * as t from 'io-ts';
import { useCallback } from 'react';

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

// end imports

const DEFAULT_SIG_THRESHOLD = 0.05;
const DEFAULT_FC_THRESHOLD = 2;

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
    data: data.value ? Object.values(data.value) : [],
    markerBodyOpacity: vizConfig.markerBodyOpacity ?? 0.5,
    significanceThreshold: vizConfig.significanceThreshold ?? 0.05,
    log2FoldChangeThreshold: vizConfig.log2FoldChangeThreshold ?? 3,
    containerStyles: plotContainerStyles,
    comparisonLabels: comparisonLabels,
    showSpinner: data.pending,
    truncationBarFill: yellow[300],
  };

  // @ts-ignore
  const plotNode = <VolcanoPlot {...volcanoPlotProps} ref={plotRef} />;

  // TODO
  const controlsNode = <> </>;

  const legendNode = data.value && (
    <PlotLegend
      type="list"
      legendTitle="Legend"
      legendItems={[
        {
          label: 'Inconclusive',
          marker: 'circle',
          hasData: true,
          markerColor: significanceColors[0],
        },
        {
          label: `Up regulated in ${computationConfiguration.comparator.groupB?.join(
            ', '
          )}`,
          marker: 'circle',
          hasData: true,
          markerColor: significanceColors[1],
        },
        {
          label: `Up regulated in ${computationConfiguration.comparator.groupA?.join(
            ', '
          )}`,
          marker: 'circle',
          hasData: true,
          markerColor: significanceColors[2],
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
