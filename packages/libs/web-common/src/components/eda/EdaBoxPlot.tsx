import Boxplot from '@veupathdb/components/lib/plots/Boxplot';
import { isFaceted } from '@veupathdb/components/lib/types/guards';
import {
  useDataClient,
  useFindEntityAndVariable,
  useStudyEntities,
  useStudyMetadata,
} from '@veupathdb/eda/lib/core';
import { leastAncestralVariable } from '@veupathdb/eda/lib/core/utils/data-element-constraints';
import { DocumentationContainer } from '@veupathdb/eda/lib/core/components/docs/DocumentationContainer';
import { boxplotResponseToData } from '@veupathdb/eda/lib/core/components/visualizations/implementations/BoxplotVisualization';
import { useCachedPromise } from '@veupathdb/eda/lib/core/hooks/cachedPromise';
import { VariableDescriptor } from '@veupathdb/eda/lib/core/types/variable';
import { WorkspaceContainer } from '@veupathdb/eda/lib/workspace/WorkspaceContainer';
import { edaServiceUrl } from '../../config';
import {
  geneSubsetFilters,
  resolveGeneDisplaySpec,
  GeneDisplaySpec,
} from './geneDisplaySpec';

interface Props {
  datasetId: string;
  xAxisVariable: VariableDescriptor;
  yAxisVariable: VariableDescriptor;
  geneDisplaySpec?: GeneDisplaySpec;
  plotTitle?: string;
}

/**
 * A simplified EDA BoxPlot component.
 *
 * This will render a plot and a legend.
 */
export function EdaBoxPlot(props: Props) {
  const { datasetId } = props;
  return (
    <DocumentationContainer>
      <WorkspaceContainer
        studyId={datasetId}
        edaServiceUrl={edaServiceUrl}
        className="EdaBoxPlot"
      >
        <BoxPlotAdapter {...props} />
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

function BoxPlotAdapter(props: AdapterProps) {
  const { xAxisVariable, yAxisVariable, geneDisplaySpec, plotTitle } = props;
  const { id: studyId } = useStudyMetadata();
  const dataClient = useDataClient();
  const findEntityAndVariable = useFindEntityAndVariable();
  const entities = useStudyEntities();

  // Both entities below are derived from the study metadata rather than
  // configured per dataset: they are facts about the study's entity tree, and a
  // stale or mistyped id would silently produce a plot of the wrong rows.
  const resolvedGeneDisplaySpec = resolveGeneDisplaySpec(
    geneDisplaySpec,
    entities
  );
  // The output entity is the leaf-most of the two axes, so an ancestor-entity
  // variable is inherited down rather than the descendant aggregated up.
  const outputEntityId =
    leastAncestralVariable([xAxisVariable, yAxisVariable], entities)
      ?.entityId ?? yAxisVariable.entityId;

  const data = useCachedPromise(
    async function getData() {
      // Unlike the scatter plot, a box plot has no per-point identity, so there
      // is nothing to highlight within it: a box of every gene's values says
      // nothing about the gene whose record page this is. Both display modes
      // therefore subset to the gene.
      const filters = geneSubsetFilters(resolvedGeneDisplaySpec);

      const boxplotDataResponse$ = dataClient.getBoxplot('pass', {
        studyId,
        filters,
        config: {
          outputEntityId,
          points: 'outliers',
          mean: 'FALSE',
          xAxisVariable,
          yAxisVariable,
        },
      });

      const boxplotDataResponse = await boxplotDataResponse$;

      const xAxisVar = findEntityAndVariable(xAxisVariable);
      const yAxisVar = findEntityAndVariable(yAxisVariable);

      if (!xAxisVar || !yAxisVar) {
        throw new Error('Could not find x or y axis variable');
      }

      // The box labels are the x-axis categories, so that is the variable
      // boxplotResponseToData needs for label formatting.
      return boxplotResponseToData(boxplotDataResponse, xAxisVar.variable);
    },
    [
      'BoxPlotAdapter',
      studyId,
      xAxisVariable,
      yAxisVariable,
      resolvedGeneDisplaySpec,
      outputEntityId,
    ]
  );

  const xAxisEntityAndVariable = findEntityAndVariable(xAxisVariable);
  const yAxisEntityAndVariable = findEntityAndVariable(yAxisVariable);

  if (data.error) {
    return <div>Error: {String(data.error)}</div>;
  }

  // A no-data response from the backend serialises as { facets: [] } (see
  // boxplotResponseToData). isFaceted() treats an empty facets array as faceted
  // via a vacuous [].every(), so detect emptiness explicitly before the throw.
  const noData =
    data.value != null &&
    (isFaceted(data.value)
      ? data.value.facets.length === 0
      : data.value.series.length === 0);

  if (noData) {
    return (
      <div>
        {plotTitle ? `${plotTitle}: no data available` : 'No data available'}
      </div>
    );
  }

  if (isFaceted(data.value)) {
    throw new Error('Received unexpected faceted data.');
  }

  return (
    <Boxplot
      interactive
      showSpinner={data.pending}
      // BoxplotVisualization shadows the components package's BoxplotData with
      // its own { series } wrapper, so the plot's data is the series within.
      data={data.value?.series}
      dependentAxisLabel={yAxisEntityAndVariable?.variable.displayName}
      independentAxisLabel={xAxisEntityAndVariable?.variable.displayName}
      displayLegend={false}
      title={plotTitle}
    />
  );
}
