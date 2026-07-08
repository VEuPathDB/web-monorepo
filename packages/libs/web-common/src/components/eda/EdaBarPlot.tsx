import Barplot from '@veupathdb/components/lib/plots/Barplot';
import { isFaceted } from '@veupathdb/components/lib/types/guards';
import {
  useDataClient,
  useFindEntityAndVariable,
  useStudyMetadata,
} from '@veupathdb/eda/lib/core';
import { DocumentationContainer } from '@veupathdb/eda/lib/core/components/docs/DocumentationContainer';
import { barplotResponseToData } from '@veupathdb/eda/lib/core/components/visualizations/implementations/BarplotVisualization';
import { useCachedPromise } from '@veupathdb/eda/lib/core/hooks/cachedPromise';
import { VariableDescriptor } from '@veupathdb/eda/lib/core/types/variable';
import { WorkspaceContainer } from '@veupathdb/eda/lib/workspace/WorkspaceContainer';
import { edaServiceUrl } from '../../config';
import { filtersFromGeneDisplaySpec, GeneDisplaySpec } from './geneDisplaySpec';

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
        className="EdaBarPlot"
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
  const findEntityAndVariable = useFindEntityAndVariable();
  const data = useCachedPromise(
    async function getData() {
      const filters = filtersFromGeneDisplaySpec(geneDisplaySpec);

      const barplotDataResponse$ = dataClient.getBarplot('pass', {
        studyId,
        filters,
        config: {
          outputEntityId: xAxisVariable.entityId,
          valueSpec: 'count',
          barMode: 'group',
          xAxisVariable,
          overlayVariable: yAxisVariable,
        },
      });

      const barplotDataResponse = await barplotDataResponse$;

      const xAxisVar = findEntityAndVariable(xAxisVariable);
      const yAxisVar = findEntityAndVariable(yAxisVariable);

      if (!xAxisVar || !yAxisVar) {
        throw new Error('Could not find x or y axis variable');
      }

      const data = barplotResponseToData(
        barplotDataResponse,
        xAxisVar.variable,
        yAxisVar.variable
      );

      // Fill in missing vocabulary labels with zero so all categories
      // are shown even when the subsetted gene has no data for them.
      const vocabulary = xAxisVar.variable.vocabulary;
      if (
        !isFaceted(data) &&
        vocabulary &&
        vocabulary.length > 0 &&
        data.series.length > 0
      ) {
        return {
          ...data,
          series: data.series.map((series) => {
            const labelToValue = new Map(
              series.label.map((l: string, i: number) => [l, series.value[i]])
            );
            return {
              ...series,
              label: vocabulary,
              value: vocabulary.map((v) => labelToValue.get(v) ?? 0),
            };
          }),
        };
      }

      return data;
    },
    ['BarPlotAdapter', studyId, xAxisVariable, yAxisVariable, geneDisplaySpec]
  );

  const xAxisEntityAndVariable = findEntityAndVariable(xAxisVariable);
  const yAxisEntityAndVariable = findEntityAndVariable(yAxisVariable);

  if (data.error) {
    return <div>Error: {String(data.error)}</div>;
  }

  // A no-data response from the backend serialises as { facets: [] } (see
  // barplotResponseToData). isFaceted() treats an empty facets array as faceted
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
