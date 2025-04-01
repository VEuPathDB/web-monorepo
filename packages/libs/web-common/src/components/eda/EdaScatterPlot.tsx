import ScatterPlot from '@veupathdb/components/lib/plots/ScatterPlot';
import { isFaceted } from '@veupathdb/components/lib/types/guards';
import {
  useDataClient,
  useFindEntityAndVariable,
  useStudyMetadata,
  useSubsettingClient,
} from '@veupathdb/eda/lib/core';
import { DocumentationContainer } from '@veupathdb/eda/lib/core/components/docs/DocumentationContainer';
import { scatterplotResponseToData } from '@veupathdb/eda/lib/core/components/visualizations/implementations/ScatterplotVisualization';
import { useCachedPromise } from '@veupathdb/eda/lib/core/hooks/cachedPromise';
import { VariableDescriptor } from '@veupathdb/eda/lib/core/types/variable';
import { WorkspaceContainer } from '@veupathdb/eda/lib/workspace/WorkspaceContainer';
import { edaServiceUrl } from '../../config';
import { HighlightedPointsDetails } from '@veupathdb/components/src/types/general';

interface HighlightSpec {
  ids: string[];
  variableId: string;
  entityId: string;
  traceName?: string;
}

interface Props {
  datasetId: string;
  xAxisVariable: VariableDescriptor;
  yAxisVariable: VariableDescriptor;
  highlightSpec?: HighlightSpec;
  plotTitle?: string;
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
      <WorkspaceContainer
        studyId={datasetId}
        edaServiceUrl={edaServiceUrl}
        className=""
      >
        <ScatterPlotAdapter {...props} />
      </WorkspaceContainer>
    </DocumentationContainer>
  );
}

interface AdapterProps {
  xAxisVariable: VariableDescriptor;
  yAxisVariable: VariableDescriptor;
  highlightSpec?: HighlightSpec;
  plotTitle?: string;
}

function ScatterPlotAdapter(props: AdapterProps) {
  const { xAxisVariable, yAxisVariable, highlightSpec, plotTitle } = props;
  const { id: studyId } = useStudyMetadata();
  const dataClient = useDataClient();
  const subsettingClient = useSubsettingClient();
  const findEntityAndVariable = useFindEntityAndVariable();
  const data = useCachedPromise(
    async function getData() {
      const scatterplotDataResponse$ = dataClient.getScatterplot(
        'xyrelationships',
        {
          studyId,
          filters: [],
          config: {
            outputEntityId: xAxisVariable.entityId,
            valueSpec: 'raw',
            xAxisVariable,
            yAxisVariable,
            returnPointIds: true,
          },
        }
      );

      const highlightDataResponse$ = highlightSpec
        ? subsettingClient.getTabularData(studyId, highlightSpec.entityId, {
            filters: [
              {
                type: 'stringSet',
                entityId: highlightSpec.entityId,
                variableId: highlightSpec.variableId,
                stringSet: highlightSpec.ids,
              },
            ],
            outputVariableIds: [highlightSpec.variableId],
          })
        : undefined;

      const [scatterplotDataResponse, highlightDataResponse] =
        await Promise.all([scatterplotDataResponse$, highlightDataResponse$]);

      const highlightVar = findEntityAndVariable({
        variableId: highlightSpec?.variableId || '',
        entityId: highlightSpec?.entityId || '',
      });

      const highlightIds = highlightDataResponse?.slice(1).map((row) => row[0]);

      const highlightedPointsDetails: HighlightedPointsDetails = {
        pointIds: highlightIds ?? [],
        highlightTraceName: highlightSpec?.traceName,
        nonHighlightTraceName: highlightVar
          ? `All ${highlightVar?.variable.displayName.toLowerCase()}s`
          : undefined,
      };

      return scatterplotResponseToData(
        scatterplotDataResponse,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        'xyrelationships',
        undefined,
        undefined,
        highlightIds && highlightedPointsDetails
      ).dataSetProcess;
    },
    ['ScatterPlotAdapter', studyId, xAxisVariable, yAxisVariable, highlightSpec]
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
      markerBodyOpacity={1}
      data={data.value}
      dependentAxisLabel={yAxisEntityAndVariable?.variable.displayName}
      independentAxisLabel={xAxisEntityAndVariable?.variable.displayName}
      title={plotTitle}
    />
  );
}
