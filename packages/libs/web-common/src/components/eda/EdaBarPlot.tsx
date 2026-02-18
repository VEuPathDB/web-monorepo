import Barplot from '@veupathdb/components/lib/plots/Barplot';
import { isFaceted } from '@veupathdb/components/lib/types/guards';
import {
  useDataClient,
  useFindEntityAndVariable,
  useStudyMetadata,
  useSubsettingClient,
} from '@veupathdb/eda/lib/core';
import { DocumentationContainer } from '@veupathdb/eda/lib/core/components/docs/DocumentationContainer';
import { barplotResponseToData } from '@veupathdb/eda/lib/core/components/visualizations/implementations/BarplotVisualization';
import { useCachedPromise } from '@veupathdb/eda/lib/core/hooks/cachedPromise';
import { VariableDescriptor } from '@veupathdb/eda/lib/core/types/variable';
import { WorkspaceContainer } from '@veupathdb/eda/lib/workspace/WorkspaceContainer';
import { edaServiceUrl } from '../../config';

interface GeneDisplaySpec {
  ids: string[];
  variableId: string;
  entityId: string;
  traceName?: string;
  mode: 'highlight' | 'subset';
}

interface Props {
  datasetId: string;
  xAxisVariable: VariableDescriptor;
  yAxisVariable: VariableDescriptor;
  geneDisplaySpec?: GeneDisplaySpec;
  plotTitle?: string;
}

/**
 * A simplified EDA BarPlot component.
 *
 * This will render a plot and a legend.
 */
export function EdaBarPlot(props: Props) {
  const { datasetId } = props;
  return (
    <DocumentationContainer>
      <WorkspaceContainer
        studyId={datasetId}
        edaServiceUrl={edaServiceUrl}
        className=""
      >
        <BarPlotAdapter {...props} />
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

function BarPlotAdapter(props: AdapterProps) {
  const { xAxisVariable, yAxisVariable, geneDisplaySpec, plotTitle } = props;
  const { id: studyId } = useStudyMetadata();
  const dataClient = useDataClient();
  const subsettingClient = useSubsettingClient();
  const findEntityAndVariable = useFindEntityAndVariable();
  const data = useCachedPromise(
    async function getData() {
      // Construct filters array if in subset mode
      const filters = geneDisplaySpec?.mode === 'subset' && geneDisplaySpec.ids.length > 0
        ? [
            {
              type: 'stringSet' as const,
              entityId: geneDisplaySpec.entityId,
              variableId: geneDisplaySpec.variableId,
              stringSet: geneDisplaySpec.ids,
            }
          ]
        : [];

      const barplotDataResponse$ = dataClient.getBarplot(
        'pass',
        {
          studyId,
          filters,
          config: {
            outputEntityId: xAxisVariable.entityId,
            valueSpec: 'count',
            xAxisVariable,
            yAxisVariable,
          },
        }
      );

      const barplotDataResponse = await barplotDataResponse$;

      const xAxisVar = findEntityAndVariable(xAxisVariable);
      const yAxisVar = findEntityAndVariable(yAxisVariable);

      if (!xAxisVar || !yAxisVar) {
        throw new Error('Could not find x or y axis variable');
      }

      return barplotResponseToData(
        barplotDataResponse,
        xAxisVar.variable,
        yAxisVar.variable
      );
    },
    ['BarPlotAdapter', studyId, xAxisVariable, yAxisVariable, geneDisplaySpec]
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
    <Barplot
      interactive
      showSpinner={data.pending}
      data={data.value}
      dependentAxisLabel={yAxisEntityAndVariable?.variable.displayName}
      independentAxisLabel={xAxisEntityAndVariable?.variable.displayName}
      displayLegend={false}
      spacingOptions={{
        marginLeft: 100,
        marginRight: 50,
      }}
    />
  );
}
