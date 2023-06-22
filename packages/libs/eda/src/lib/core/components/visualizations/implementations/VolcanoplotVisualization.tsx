// load scatter plot component
import VolcanoPlot, {
  VolcanoPlotProps,
} from '@veupathdb/components/lib/plots/VolcanoPlot';

import * as t from 'io-ts';
import { useCallback, useState } from 'react';

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
import { NumberRange } from '../../../types/general';
import { useVizConfig } from '../../../hooks/visualizations';
import { createVisualizationPlugin } from '../VisualizationPlugin';
import LabelledGroup from '@veupathdb/components/lib/components/widgets/LabelledGroup';
import { NumberInput } from '@veupathdb/components/lib/components/widgets/NumberAndDateInputs';

import { LayoutOptions } from '../../layouts/types';
import { RequestOptions } from '../options/types';

// Volcano plot imports
import DataClient, {
  VolcanoPlotRequestParams,
  VolcanoplotResponse,
} from '../../../api/DataClient';
import VolcanoSVG from './selectorIcons/VolcanoSVG';
import { NumberOrDate } from '@veupathdb/components/lib/types/general';

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

export const volcanoplotVisualization = createVisualizationPlugin({
  selectorIcon: VolcanoSVG,
  fullscreenComponent: VolcanoplotViz,
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
function VolcanoplotViz(props: VisualizationProps<Options>) {
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

  const [vizConfig, updateVizConfig] = useVizConfig(
    visualization.descriptor.configuration,
    VolcanoPlotConfig,
    createDefaultConfig,
    updateConfiguration
  );

  // NOT YET IMPLEMENTED set the state of truncation warning message
  // probably dont need to use state for these warnings. could derive it from the viz config
  // Rule: if you can derive something from props, dont use state! State is "expensive"
  // every time you update state it causes component to rerender. Also means we have to keep state
  // in sync with props
  const [truncatedIndependentAxisWarning, setTruncatedIndependentAxisWarning] =
    useState<string>('');
  const [truncatedDependentAxisWarning, setTruncatedDependentAxisWarning] =
    useState<string>('');

  // Get the volcano plot data!
  const data = usePromise(
    useCallback(async (): Promise<VolcanoplotResponse | undefined> => {
      // Only need to check compute job status and filter status, since there are no
      // input variables.
      if (computeJobStatus !== 'complete') return undefined;
      if (filteredCounts.pending || filteredCounts.value == null)
        return undefined;

      // There are _no_ viz request params for the volcano plot (config: {}).
      // The data service streams the volcano data directly from the compute service.
      const params = {
        studyId,
        filters,
        config: {},
        computeConfig: computation.descriptor.configuration,
      };
      const response = await dataClient.getVisualizationData(
        computation.descriptor.type,
        visualization.descriptor.type,
        params,
        VolcanoplotResponse // CAsInG
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
      computation.descriptor.configuration,
      computation.descriptor.type,
      dataClient,
      visualization.descriptor.type,
    ])
  );

  // TODO set based on input data. Requires update to VolcanoPlot.tsx
  const defaultIndependentAxisRange = { min: -5, max: 5 } as NumberRange;
  const defaultDependentAxisRange = { min: 0, max: 5 } as NumberRange;

  // TODO update thumbnail
  const plotRef = useUpdateThumbnailEffect(
    updateThumbnail,
    plotContainerStyles,
    [
      data,
      // vizConfig.checkedLegendItems,
      // vizConfig.independentAxisRange,
      // vizConfig.dependentAxisRange,
      vizConfig.markerBodyOpacity,
    ]
  );

  // Casing is messed up!! volcanoplot vs volcanoPlot
  const volcanoplotProps: VolcanoPlotProps = {
    data: data.value ? Object.values(data.value) : [],
    independentAxisRange: defaultIndependentAxisRange,
    dependentAxisRange: defaultDependentAxisRange,
    markerBodyOpacity: vizConfig.markerBodyOpacity ?? 0.5,
    significanceThreshold: vizConfig.significanceThreshold ?? 0.05,
    log2FoldChangeThreshold: vizConfig.log2FoldChangeThreshold ?? 3,
    containerStyles: plotContainerStyles,
  };

  const plotNode = <VolcanoPlot {...volcanoplotProps} />;

  // TODO
  const controlsNode = <> </>;

  // TODO
  const legendNode = {};

  // TODO
  const tableGroupNode = <> </>;

  const LayoutComponent = options?.layoutComponent ?? PlotLayout;

  // defining styles inline are getting out of hand! possibly going back to css/scss and away from emotion
  // can cause performance issues if rendering lots of things
  // browser doesnt know if the style object is the same - it has to reprocess each time.
  // emotion isn't as future proof as stylesheets
  // Tailwind as an option? @ann make an issue!

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* does labelledgroup have a container prop? Then we could control what's inside it better. 
          or specify direction? JM and DF */}
      <LabelledGroup label="Threshold lines">
        {/* The following are always numbers, never dates. Need a bit of type cleaning */}
        <NumberInput
          onValueChange={(newValue?: NumberOrDate) =>
            updateVizConfig({ log2FoldChangeThreshold: Number(newValue) })
          }
          label="log2(Fold Change)"
          minValue={0}
          value={DEFAULT_FC_THRESHOLD}
          containerStyles={{ flex: 1 }}
        />

        <NumberInput
          label="P-Value"
          onValueChange={(newValue?: NumberOrDate) =>
            updateVizConfig({ significanceThreshold: Number(newValue) })
          }
          minValue={0}
          value={DEFAULT_SIG_THRESHOLD}
          containerStyles={{ flex: 1 }}
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
        legendNode={true}
        plotNode={plotNode}
        controlsNode={controlsNode}
        tableGroupNode={tableGroupNode}
        showRequiredInputsPrompt={false}
      />
    </div>
  );
}
