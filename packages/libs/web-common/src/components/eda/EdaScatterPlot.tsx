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
import pluralize from 'pluralize';
import { filtersFromGeneDisplaySpec, GeneDisplaySpec } from './geneDisplaySpec';

interface Props {
  datasetId: string;
  xAxisVariable: VariableDescriptor;
  yAxisVariable: VariableDescriptor;
  geneDisplaySpec?: GeneDisplaySpec;
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
  geneDisplaySpec?: GeneDisplaySpec;
  plotTitle?: string;
}

function ScatterPlotAdapter(props: AdapterProps) {
  const { xAxisVariable, yAxisVariable, geneDisplaySpec, plotTitle } = props;
  const { id: studyId } = useStudyMetadata();
  const dataClient = useDataClient();
  const subsettingClient = useSubsettingClient();
  const findEntityAndVariable = useFindEntityAndVariable();
  const data = useCachedPromise(
    async function getData() {
      const filters = filtersFromGeneDisplaySpec(geneDisplaySpec);

      const scatterplotDataResponse$ = dataClient.getScatterplot(
        'xyrelationships',
        {
          studyId,
          filters,
          config: {
            outputEntityId: xAxisVariable.entityId,
            valueSpec: 'raw',
            xAxisVariable,
            yAxisVariable,
            returnPointIds: true,
          },
        }
      );

      // Get highlight data only if in highlight mode
      const highlightDataResponse$ =
        geneDisplaySpec?.mode === 'highlight' && geneDisplaySpec.ids.length > 0
          ? subsettingClient.getTabularData(studyId, geneDisplaySpec.entityId, {
              filters: [
                {
                  type: 'stringSet',
                  entityId: geneDisplaySpec.entityId,
                  variableId: geneDisplaySpec.variableId,
                  stringSet: geneDisplaySpec.ids,
                },
              ],
              outputVariableIds: [geneDisplaySpec.variableId],
            })
          : undefined;

      const [scatterplotDataResponse, highlightDataResponse] =
        await Promise.all([scatterplotDataResponse$, highlightDataResponse$]);

      const highlightVar = findEntityAndVariable({
        variableId: geneDisplaySpec?.variableId || '',
        entityId: geneDisplaySpec?.entityId || '',
      });

      const highlightIds = highlightDataResponse?.slice(1).map((row) => row[0]);

      const highlightedPointsDetails: HighlightedPointsDetails = {
        pointIds: highlightIds ?? [],
        highlightTraceName: geneDisplaySpec?.traceName,
        nonHighlightTraceName: highlightVar
          ? `All ${pluralize(
              highlightVar?.variable.displayName.toLowerCase(),
              2
            )}`
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
        // Pass highlight details only in highlight mode
        geneDisplaySpec?.mode === 'highlight' && highlightIds
          ? highlightedPointsDetails
          : undefined
      ).dataSetProcess;
    },
    [
      'ScatterPlotAdapter',
      studyId,
      xAxisVariable,
      yAxisVariable,
      geneDisplaySpec,
    ]
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
