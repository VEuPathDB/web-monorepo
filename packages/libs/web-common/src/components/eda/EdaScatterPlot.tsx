import ScatterPlot from '@veupathdb/components/lib/plots/ScatterPlot';
import { isFaceted } from '@veupathdb/components/lib/types/guards';
import {
  useDataClient,
  useFindEntityAndVariable,
  useStudyMetadata,
} from '@veupathdb/eda/lib/core';
import { DocumentationContainer } from '@veupathdb/eda/lib/core/components/docs/DocumentationContainer';
import { scatterplotResponseToData } from '@veupathdb/eda/lib/core/components/visualizations/implementations/ScatterplotVisualization';
import { useCachedPromise } from '@veupathdb/eda/lib/core/hooks/cachedPromise';
import { VariableDescriptor } from '@veupathdb/eda/lib/core/types/variable';
import { WorkspaceContainer } from '@veupathdb/eda/lib/workspace/WorkspaceContainer';
import { edaServiceUrl } from '../../config';

interface Props {
  datasetId: string;
  xAxisVariable: VariableDescriptor;
  yAxisVariable: VariableDescriptor;
}

/**
 * A simplified EDA ScatterPlot component.
 *
 * This will render a plot and a legend.
 */
export function EdaScatterPlot(props: Props) {
  const { datasetId } = props;
  return (
    <DocumentationContainer>
      <WorkspaceContainer studyId={datasetId} edaServiceUrl={edaServiceUrl}>
        <ScatterPlotAdapter {...props} />
      </WorkspaceContainer>
    </DocumentationContainer>
  );
}

interface AdapterProps {
  xAxisVariable: VariableDescriptor;
  yAxisVariable: VariableDescriptor;
}

function ScatterPlotAdapter(props: AdapterProps) {
  const { xAxisVariable, yAxisVariable } = props;
  const { id: studyId } = useStudyMetadata();
  const dataClient = useDataClient();
  const findEntityAndVariable = useFindEntityAndVariable();
  const data = useCachedPromise(
    async function getData() {
      const response = await dataClient.getScatterplot('xyrelationships', {
        studyId,
        filters: [],
        config: {
          outputEntityId: xAxisVariable.entityId,
          valueSpec: 'raw',
          xAxisVariable,
          yAxisVariable,
          // maxAllowedDataPoints: 1_000,
        },
      });
      return scatterplotResponseToData(response).dataSetProcess;
    },
    ['ScatterPlotAdapter', studyId, xAxisVariable, yAxisVariable]
  );

  const xAxisEntityAndVariable = findEntityAndVariable(xAxisVariable);
  const yAxisEntityAndVariable = findEntityAndVariable(yAxisVariable);

  if (isFaceted(data.value)) {
    throw new Error('Received unexpected faceted data.');
  }

  if (data.error) {
    return <div>Error: {String(data.error)}</div>;
  }

  return (
    <ScatterPlot
      interactive
      showSpinner={data.pending}
      markerBodyOpacity={0.5}
      data={data.value}
      dependentAxisLabel={yAxisEntityAndVariable?.variable.displayName}
      independentAxisLabel={xAxisEntityAndVariable?.variable.displayName}
    />
  );
}
